import * as esquema from '@ablaze/db/sqlite';
import { count, getTableColumns, type Table } from 'drizzle-orm';

import { abrirBaseLocal } from '../basededatos/index.ts';

/**
 * Sacar todo a un archivo y volver a meterlo.
 *
 * Safari desaloja el almacenamiento de los sitios que no se usan, y el usuario
 * no puede impedirlo. La sincronización con el servidor es la red principal;
 * esto es la de mano, y además resuelve una de las quejas que el documento le
 * achaca al mercado: datos secuestrados sin exportación.
 *
 * El archivo es JSON legible por una persona, no un volcado binario: la idea es
 * poder abrirlo y ver qué hay, no solo confiar en que está.
 */

/** Sube si el formato cambia de forma incompatible. */
export const VERSION_DEL_RESPALDO = 1;

/**
 * Orden de inserción, no alfabético: las tablas que otras referencian van
 * primero o las claves foráneas fallan al restaurar.
 */
const TABLAS: { nombre: string; tabla: Table }[] = [
  { nombre: 'users', tabla: esquema.users },
  { nombre: 'profiles', tabla: esquema.profiles },
  { nombre: 'gyms', tabla: esquema.gyms },
  { nombre: 'exercises', tabla: esquema.exercises },
  { nombre: 'gym_machines', tabla: esquema.gymMachines },
  { nombre: 'routines', tabla: esquema.routines },
  { nombre: 'routine_exercises', tabla: esquema.routineExercises },
  { nombre: 'time_blocks', tabla: esquema.timeBlocks },
  { nombre: 'sessions', tabla: esquema.sessions },
  { nombre: 'sets', tabla: esquema.sets },
  { nombre: 'flame_log', tabla: esquema.flameLog },
  { nombre: 'measurements', tabla: esquema.measurements },
  { nombre: 'photos', tabla: esquema.photos },
  { nombre: 'injuries', tabla: esquema.injuries },
  { nombre: 'foods', tabla: esquema.foods },
  { nombre: 'user_foods', tabla: esquema.userFoods },
  { nombre: 'food_log', tabla: esquema.foodLog },
  { nombre: 'friendships', tabla: esquema.friendships },
];

export type Respaldo = {
  aplicacion: 'ablaze';
  version: number;
  exportadoEn: string;
  filas: Record<string, number>;
  tablas: Record<string, Record<string, unknown>[]>;
};

/**
 * Qué columnas de una tabla son fechas.
 *
 * Se saca del propio esquema en vez de escribirlo a mano: una lista escrita a
 * mano se queda atrás la primera vez que alguien añada una columna, y entonces
 * el respaldo restaura una fecha como texto sin que nada avise.
 */
function columnasDeFecha(tabla: Table): Set<string> {
  const fechas = new Set<string>();
  for (const [nombre, columna] of Object.entries(getTableColumns(tabla))) {
    if (columna.dataType === 'date') fechas.add(nombre);
  }
  return fechas;
}

export async function exportar(): Promise<Respaldo> {
  const { db } = await abrirBaseLocal();

  const tablas: Record<string, Record<string, unknown>[]> = {};
  const filas: Record<string, number> = {};

  for (const { nombre, tabla } of TABLAS) {
    const datos = (await db.select().from(tabla)) as Record<string, unknown>[];
    // Las fechas salen en ISO para que el archivo se pueda leer. Al restaurar se
    // vuelven a convertir con la misma lista de columnas.
    tablas[nombre] = datos.map((fila) => {
      const copia: Record<string, unknown> = {};
      for (const [clave, valor] of Object.entries(fila)) {
        copia[clave] = valor instanceof Date ? valor.toISOString() : valor;
      }
      return copia;
    });
    filas[nombre] = datos.length;
  }

  return {
    aplicacion: 'ablaze',
    version: VERSION_DEL_RESPALDO,
    exportadoEn: new Date().toISOString(),
    filas,
    tablas,
  };
}

export type ResultadoDeImportacion = {
  /** Las que de verdad entraron, no las que traía el archivo. */
  insertadas: Record<string, number>;
  total: number;
  /** Las que ya estaban y por eso se ignoraron. Restaurar dos veces no duplica. */
  yaEstaban: number;
};

/**
 * Mete de vuelta lo de un archivo.
 *
 * No borra nada: usa «ignorar si ya existe». Restaurar sobre una base con datos
 * no debería poder destruirlos, y como los identificadores se conservan, volver
 * a importar el mismo archivo dos veces no duplica.
 */
export async function importar(contenido: string): Promise<ResultadoDeImportacion> {
  let respaldo: Respaldo;
  try {
    respaldo = JSON.parse(contenido) as Respaldo;
  } catch {
    throw new Error('El archivo no es JSON válido.');
  }

  if (respaldo.aplicacion !== 'ablaze') {
    throw new Error('Este archivo no es un respaldo de Ablaze.');
  }
  if (respaldo.version > VERSION_DEL_RESPALDO) {
    throw new Error(
      `El respaldo es de una versión más nueva (${respaldo.version}) que esta aplicación. Actualízala antes de restaurar.`,
    );
  }

  const { db } = await abrirBaseLocal();
  const insertadas: Record<string, number> = {};
  let total = 0;
  let yaEstaban = 0;

  for (const { nombre, tabla } of TABLAS) {
    const datos = respaldo.tablas?.[nombre];
    if (!datos || datos.length === 0) continue;

    // Se cuenta antes y después. Informar de las filas que traía el archivo en
    // vez de las que entraron diría «restauradas 146» aunque no haya entrado
    // ninguna, que es justo lo que alguien necesita saber tras perder sus datos.
    const antes = await contarFilas(db, tabla);

    const fechas = columnasDeFecha(tabla);
    const filas = datos.map((fila) => {
      const copia: Record<string, unknown> = {};
      for (const [clave, valor] of Object.entries(fila)) {
        copia[clave] = fechas.has(clave) && typeof valor === 'string' ? new Date(valor) : valor;
      }
      return copia;
    });

    // Por lotes: un INSERT con miles de filas se pasa del límite de parámetros
    // de SQLite, y `sets` es justo la tabla que va a tener miles.
    for (let i = 0; i < filas.length; i += 40) {
      await db
        .insert(tabla)
        .values(filas.slice(i, i + 40) as never)
        .onConflictDoNothing();
    }

    const entraron = (await contarFilas(db, tabla)) - antes;
    if (entraron > 0) insertadas[nombre] = entraron;
    total += entraron;
    yaEstaban += filas.length - entraron;
  }

  return { insertadas, total, yaEstaban };
}

async function contarFilas(
  db: Awaited<ReturnType<typeof abrirBaseLocal>>['db'],
  tabla: Table,
): Promise<number> {
  const [fila] = await db.select({ n: count() }).from(tabla);
  return fila?.n ?? 0;
}

export function nombreDelArchivo(): string {
  const hoy = new Date().toISOString().slice(0, 10);
  return `ablaze-respaldo-${hoy}.json`;
}
