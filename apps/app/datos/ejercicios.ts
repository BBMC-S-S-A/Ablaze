import type { Equipamiento, Musculo } from '@ablaze/db';
import { exercises, type Exercise } from '@ablaze/db/sqlite';
import { asc, eq } from 'drizzle-orm';

import { abrirBaseLocal } from '../basededatos/index.ts';
import { USUARIO_LOCAL_ID } from '../basededatos/sembrar.ts';

export type Filtros = {
  texto?: string;
  musculo?: Musculo;
  equipamiento?: Equipamiento;
  /** Solo los que creó el usuario. */
  soloMios?: boolean;
};

/**
 * Quita acentos y pasa a minúsculas para poder buscar.
 *
 * Hace falta porque el `LIKE` de SQLite no ignora los acentos: buscar «pajaros»
 * no encontraría «Pájaros», que es exactamente lo que alguien escribe con una
 * mano en el gimnasio.
 */
function normalizar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim();
}

/**
 * Trae el catálogo entero y filtra en memoria.
 *
 * Con 136 ejercicios esto cuesta menos que ir y volver a la base por cada letra
 * que se teclea, y además resuelve lo de los acentos sin tocar el esquema. Si
 * algún día son varios miles, lo que toca es una columna con el nombre
 * normalizado y su índice, no seguir cargándolo todo.
 */
export async function listarEjercicios(filtros: Filtros = {}): Promise<Exercise[]> {
  const { db } = await abrirBaseLocal();
  const todos = await db.select().from(exercises).orderBy(asc(exercises.nombre));

  const texto = filtros.texto ? normalizar(filtros.texto) : '';

  return todos.filter((e) => {
    if (filtros.soloMios && e.userId === null) return false;
    if (filtros.musculo && e.musculoPrincipal !== filtros.musculo) return false;
    if (filtros.equipamiento && e.equipamiento !== filtros.equipamiento) return false;
    if (texto && !normalizar(e.nombre).includes(texto)) return false;
    return true;
  });
}

export type EjercicioNuevo = {
  nombre: string;
  musculoPrincipal: Musculo;
  musculosSecundarios: Musculo[];
  equipamiento: Equipamiento;
  unilateral?: boolean;
};

/**
 * Crea un ejercicio propio, clasificado igual que los del catálogo: con músculo
 * principal, secundarios y equipamiento. Sin eso no entraría en el cálculo de
 * volumen ni en la sustitución, y sería una etiqueta suelta en el historial.
 *
 * A diferencia de los del catálogo, este lleva dueño y nace privado.
 */
export async function crearEjercicio(datos: EjercicioNuevo): Promise<Exercise> {
  const nombre = datos.nombre.trim();
  if (nombre.length === 0) throw new Error('El ejercicio necesita un nombre.');

  if (datos.musculosSecundarios.includes(datos.musculoPrincipal)) {
    throw new Error('Un músculo no puede ser principal y secundario a la vez.');
  }

  const { db } = await abrirBaseLocal();

  // Se compara normalizado, así que «sentadilla bulgara» choca con «Sentadilla
  // búlgara». El mensaje dice el nombre del que ya existe y no el que se acaba
  // de escribir: si solo cambian las tildes, repetir lo tecleado parece un error
  // de la aplicación.
  const existente = (await listarEjercicios({ texto: nombre })).find(
    (e) => normalizar(e.nombre) === normalizar(nombre),
  );
  if (existente) throw new Error(`Ya existe un ejercicio que se llama «${existente.nombre}».`);

  const fila = {
    id: crypto.randomUUID(),
    userId: USUARIO_LOCAL_ID,
    nombre,
    musculoPrincipal: datos.musculoPrincipal,
    musculosSecundarios: datos.musculosSecundarios,
    equipamiento: datos.equipamiento,
    unilateral: datos.unilateral ?? false,
    visibilidad: 'privado' as const,
  };

  await db.insert(exercises).values(fila);

  const [creado] = await listarEjercicios({ texto: nombre });
  if (!creado) throw new Error('El ejercicio se insertó pero no se pudo volver a leer.');
  return creado;
}

/** Uno concreto, por id. Lo necesita la pantalla de registro para saber qué se está haciendo. */
export async function obtenerEjercicio(id: string): Promise<Exercise | null> {
  const { db } = await abrirBaseLocal();
  const [fila] = await db.select().from(exercises).where(eq(exercises.id, id));
  return fila ?? null;
}

/**
 * Cuánto sube y baja el peso en este ejercicio.
 *
 * Una barra va de 2,5 en 2,5 porque son los discos más pequeños que suele haber;
 * un stack de máquina va de 5 en 5 porque esas son las placas. Poner un paso
 * único obligaría a dar seis toques para cambiar de 60 a 90 kilos.
 */
export function pasoDePeso(equipamiento: Equipamiento): number {
  switch (equipamiento) {
    case 'barra':
      return 2.5;
    case 'mancuerna':
      return 2;
    case 'maquina':
    case 'polea':
      return 5;
    case 'kettlebell':
      return 4;
    default:
      return 1;
  }
}
