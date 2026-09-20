/**
 * Comprueba que schema.pg.ts y schema.sqlite.ts describen la misma base.
 *
 * El esquema se escribe dos veces porque Drizzle no genera los dos dialectos
 * desde una definición, y eso abre la puerta a que se separen sin que nadie se
 * entere: una columna añadida en el servidor y olvidada en el dispositivo
 * rompe la sincronización meses después, lejos del commit que la causó. Esto lo
 * detecta en el momento.
 *
 * Compara nombres de tabla, nombres de columna, nulabilidad y claves primarias.
 * NO compara tipos, porque los tipos son distintos a propósito: uuid contra
 * texto, timestamp contra entero, arreglo contra JSON.
 *
 *   npm run check -w @ablaze/db
 */
import { getTableConfig as configPg } from 'drizzle-orm/pg-core';
import { getTableConfig as configSqlite } from 'drizzle-orm/sqlite-core';

import * as pg from '../src/schema.pg.ts';
import * as sqlite from '../src/schema.sqlite.ts';

type Columna = { nombre: string; obligatoria: boolean; primaria: boolean };
type Tabla = { nombre: string; columnas: Map<string, Columna> };

function leer(
  modulo: Record<string, unknown>,
  config: (tabla: never) => { name: string; columns: readonly { name: string; notNull: boolean; primary: boolean }[] },
): Map<string, Tabla> {
  const tablas = new Map<string, Tabla>();
  for (const valor of Object.values(modulo)) {
    let cfg;
    try {
      cfg = config(valor as never);
    } catch {
      continue; // No es una tabla (un tipo, una constante).
    }
    const columnas = new Map<string, Columna>();
    for (const c of cfg.columns) {
      columnas.set(c.name, { nombre: c.name, obligatoria: c.notNull, primaria: c.primary });
    }
    tablas.set(cfg.name, { nombre: cfg.name, columnas });
  }
  return tablas;
}

const tablasPg = leer(pg, configPg);
const tablasSqlite = leer(sqlite, configSqlite);

const problemas: string[] = [];

for (const nombre of tablasPg.keys()) {
  if (!tablasSqlite.has(nombre)) problemas.push(`tabla «${nombre}» está en Postgres y falta en SQLite`);
}
for (const nombre of tablasSqlite.keys()) {
  if (!tablasPg.has(nombre)) problemas.push(`tabla «${nombre}» está en SQLite y falta en Postgres`);
}

for (const [nombre, tablaPg] of tablasPg) {
  const tablaSqlite = tablasSqlite.get(nombre);
  if (!tablaSqlite) continue;

  for (const [columna, cPg] of tablaPg.columnas) {
    const cSqlite = tablaSqlite.columnas.get(columna);
    if (!cSqlite) {
      problemas.push(`${nombre}.${columna} está en Postgres y falta en SQLite`);
      continue;
    }
    if (cPg.obligatoria !== cSqlite.obligatoria) {
      problemas.push(
        `${nombre}.${columna} difiere en nulabilidad: Postgres ${cPg.obligatoria ? 'NOT NULL' : 'nullable'}, SQLite ${cSqlite.obligatoria ? 'NOT NULL' : 'nullable'}`,
      );
    }
    if (cPg.primaria !== cSqlite.primaria) {
      problemas.push(`${nombre}.${columna} difiere en clave primaria`);
    }
  }

  for (const columna of tablaSqlite.columnas.keys()) {
    if (!tablaPg.columnas.has(columna)) {
      problemas.push(`${nombre}.${columna} está en SQLite y falta en Postgres`);
    }
  }
}

const totalColumnas = [...tablasPg.values()].reduce((n, t) => n + t.columnas.size, 0);

if (problemas.length > 0) {
  console.error(`Los dos esquemas se separaron. ${problemas.length} diferencia(s):\n`);
  for (const p of problemas) console.error(`  - ${p}`);
  process.exit(1);
}

console.log(`Los dos esquemas coinciden: ${tablasPg.size} tablas, ${totalColumnas} columnas.`);
