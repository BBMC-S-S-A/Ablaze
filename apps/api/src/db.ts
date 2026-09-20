import { drizzle } from 'drizzle-orm/node-postgres';
import { sql } from 'drizzle-orm';
import { Pool } from 'pg';

import * as schema from '@ablaze/db/pg';

import { env } from './env.ts';

/**
 * Sin DATABASE_URL la API funciona igual, solo que sin persistencia. Es el estado
 * normal mientras Postgres no esté levantado en Railway, y lo dice /health en vez
 * de fingir que todo va bien.
 */
const pool = env.DATABASE_URL ? new Pool({ connectionString: env.DATABASE_URL }) : null;

export const db = pool ? drizzle(pool, { schema }) : null;

export async function comprobarBaseDeDatos(): Promise<'conectada' | 'sin configurar' | 'inalcanzable'> {
  if (!db) return 'sin configurar';
  try {
    await db.execute(sql`select 1`);
    return 'conectada';
  } catch {
    return 'inalcanzable';
  }
}

export async function cerrarBaseDeDatos(): Promise<void> {
  await pool?.end();
}
