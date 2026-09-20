import { MIGRACIONES_SQLITE } from '@ablaze/db/migraciones';

import type { Motor } from './motor.tipos.ts';

/**
 * Aplica las migraciones que falten, en orden, y anota cuáles se aplicaron.
 *
 * No usa el migrador de Drizzle porque ese lee los `.sql` del disco, y en el
 * dispositivo no hay disco que leer: el SQL viaja dentro del bundle. Ver
 * `packages/db/scripts/empaquetar-migraciones.ts`.
 */

const TABLA = '_migraciones_aplicadas';

export type ResultadoDeMigracion = {
  aplicadas: string[];
  yaEstaban: string[];
};

export async function migrar(motor: Motor): Promise<ResultadoDeMigracion> {
  await motor.ejecutar(
    `CREATE TABLE IF NOT EXISTS ${TABLA} (
       tag TEXT PRIMARY KEY,
       aplicada_en INTEGER NOT NULL
     )`,
    [],
  );

  const filas = await motor.ejecutar(`SELECT tag FROM ${TABLA}`, []);
  const yaEstaban = filas.map((f) => String(f[0]));
  const aplicadas: string[] = [];

  for (const migracion of MIGRACIONES_SQLITE) {
    if (yaEstaban.includes(migracion.tag)) continue;

    // Cada migración es atómica: o entran todas sus sentencias o no entra
    // ninguna. Una migración a medias deja la base en un estado que no
    // corresponde a ninguna versión del esquema, y de ahí no se sale solo.
    await motor.ejecutar('BEGIN', []);
    try {
      for (const sentencia of migracion.sentencias) {
        await motor.ejecutar(sentencia, []);
      }
      await motor.ejecutar(`INSERT INTO ${TABLA} (tag, aplicada_en) VALUES (?, ?)`, [
        migracion.tag,
        Date.now(),
      ]);
      await motor.ejecutar('COMMIT', []);
      aplicadas.push(migracion.tag);
    } catch (error) {
      await motor.ejecutar('ROLLBACK', []);
      throw new Error(
        `La migración «${migracion.tag}» falló y se deshizo entera: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  return { aplicadas, yaEstaban };
}
