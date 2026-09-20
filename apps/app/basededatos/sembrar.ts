import { CATALOGO_DE_EJERCICIOS } from '@ablaze/db/catalogo';
import { exercises, users } from '@ablaze/db/sqlite';
import { count, isNull } from 'drizzle-orm';
import type { SqliteRemoteDatabase } from 'drizzle-orm/sqlite-proxy';

/**
 * El usuario de este dispositivo.
 *
 * El documento pide que toda fila lleve dueño desde el primer día, aunque hoy el
 * único usuario seas tú: es la condición para poder compartir la app sin
 * reescribirla. Y en la práctica hace falta ya, porque `profiles.user_id` y
 * compañía son NOT NULL y sin una fila en `users` no se puede guardar nada del
 * onboarding.
 *
 * El id es fijo a propósito. Cuando existan cuentas de verdad, esta fila se
 * reconcilia con la del servidor en vez de duplicar el historial.
 */
export const USUARIO_LOCAL_ID = '00000000-0000-4000-8000-000000000001';

/** Cuántas filas caben cómodamente en un INSERT. Evita acercarse al límite de parámetros de SQLite. */
const LOTE = 40;

export type ResultadoDeSembrado = {
  ejerciciosInsertados: number;
  ejerciciosQueYaEstaban: number;
};

/**
 * Deja la base lista para usarse: el usuario local y el catálogo de ejercicios.
 *
 * Es idempotente. Los ejercicios del catálogo tienen id derivado de su clave, así
 * que reinsertarlos no duplica nada y actualizar el catálogo solo añade lo nuevo.
 * Lo que el usuario haya creado o editado no se toca.
 */
export async function sembrar(
  db: SqliteRemoteDatabase<Record<string, unknown>>,
): Promise<ResultadoDeSembrado> {
  await db
    .insert(users)
    .values({
      id: USUARIO_LOCAL_ID,
      email: 'local@ablaze.app',
      nombre: 'Yo',
    })
    .onConflictDoNothing();

  // Con el constructor tipado y no con SQL crudo: el driver proxy devuelve las
  // filas como arreglos, así que un `select count(*) as total` a mano llega como
  // [[136]] y leer `.total` da undefined. Silencioso y engañoso.
  const habia = await contarCatalogo(db);

  for (let i = 0; i < CATALOGO_DE_EJERCICIOS.length; i += LOTE) {
    const lote = CATALOGO_DE_EJERCICIOS.slice(i, i + LOTE);
    await db
      .insert(exercises)
      .values(
        lote.map((e) => ({
          id: e.id,
          // Sin dueño: es catálogo compartido, no algo que el usuario escribió.
          userId: null,
          nombre: e.nombre,
          musculoPrincipal: e.musculoPrincipal,
          musculosSecundarios: e.musculosSecundarios,
          equipamiento: e.equipamiento,
          unilateral: e.unilateral,
          visibilidad: 'publico' as const,
        })),
      )
      .onConflictDoNothing();
  }

  const ahora = await contarCatalogo(db);

  return {
    ejerciciosInsertados: ahora - habia,
    ejerciciosQueYaEstaban: habia,
  };
}

/** Los del catálogo son los que no tienen dueño. */
async function contarCatalogo(
  db: SqliteRemoteDatabase<Record<string, unknown>>,
): Promise<number> {
  const [fila] = await db
    .select({ total: count() })
    .from(exercises)
    .where(isNull(exercises.userId));
  return fila?.total ?? 0;
}
