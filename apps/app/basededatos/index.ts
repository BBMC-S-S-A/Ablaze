import * as esquema from '@ablaze/db/sqlite';
import { drizzle, type SqliteRemoteDatabase } from 'drizzle-orm/sqlite-proxy';

import { migrar, type ResultadoDeMigracion } from './migrar.ts';
// Sin extensión a propósito, y es el único import del proyecto que lo hace.
// Metro elige `motor.web.ts` o `motor.ts` según la plataforma, pero solo si el
// import no dice la extensión: escribir `./motor.ts` resuelve ese archivo exacto
// y la app web se lleva el motor nativo, que lo único que hace es fallar.
import { abrirMotor } from './motor';
import type { Motor } from './motor.tipos.ts';
import { asegurarPersistencia, type EstadoDelAlmacenamiento } from './persistencia.ts';
import { sembrar, type ResultadoDeSembrado } from './sembrar.ts';

export type BaseLocal = {
  db: SqliteRemoteDatabase<typeof esquema>;
  motor: Motor;
  almacenamiento: EstadoDelAlmacenamiento;
  migracion: ResultadoDeMigracion;
  sembrado: ResultadoDeSembrado;
};

let promesa: Promise<BaseLocal> | null = null;

/**
 * Abre la base local del dispositivo. Devuelve siempre la misma: abrirla dos
 * veces sobre el mismo archivo de OPFS falla, y además la app solo necesita una.
 *
 * Hace cuatro cosas, en este orden y no en otro:
 *   1. pide persistencia al navegador, antes de escribir nada
 *   2. abre el motor
 *   3. aplica las migraciones que falten
 *   4. siembra el usuario local y el catálogo de ejercicios
 */
export function abrirBaseLocal(): Promise<BaseLocal> {
  promesa ??= (async () => {
    const almacenamiento = await asegurarPersistencia();
    const motor = await abrirMotor();
    const migracion = await migrar(motor);

    const db = drizzle(
      async (sql, params, method) => {
        const filas = await motor.ejecutar(sql, params);
        // `get` espera una fila suelta, no una lista de filas. Devolver la lista
        // aquí hace que Drizzle lea la primera columna como si fuera la fila.
        if (method === 'get') return { rows: filas[0] ?? [] };
        return { rows: filas };
      },
      { schema: esquema },
    );

    const sembrado = await sembrar(db);

    return { db, motor, almacenamiento, migracion, sembrado };
  })();

  return promesa;
}

/** Solo para las pruebas y para el diagnóstico: olvida la instancia abierta. */
export async function cerrarBaseLocal(): Promise<void> {
  const abierta = promesa;
  promesa = null;
  if (abierta) {
    const { motor } = await abierta;
    await motor.cerrar();
  }
}

export type { EstadoDelAlmacenamiento, Motor, ResultadoDeMigracion };
