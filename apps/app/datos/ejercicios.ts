import type { Equipamiento, Musculo } from '@ablaze/db';
import { exercises, type Exercise } from '@ablaze/db/sqlite';
import { asc } from 'drizzle-orm';

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
