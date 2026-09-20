/**
 * Esquema de SQLite: la fuente de verdad.
 *
 * Esta es la base que vive en el dispositivo, sobre OPFS cuando corre como PWA.
 * Registrar una serie escribe aquí y nunca depende de la red: los sótanos de los
 * gimnasios no tienen señal.
 *
 * Diferencias obligadas respecto a Postgres, no decisiones de estilo:
 *   - los identificadores son texto, porque SQLite no tiene uuid nativo
 *   - las fechas son enteros en milisegundos desde epoch
 *   - los arreglos van en JSON, porque SQLite no tiene columnas de arreglo
 */
import { sql } from 'drizzle-orm';
import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

import { EQUIPAMIENTOS, MUSCULOS, VISIBILIDADES, type Musculo } from './domain.ts';

const ahora = sql`(unixepoch() * 1000)`;

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  nombre: text('nombre').notNull(),
  creadoEn: integer('creado_en', { mode: 'timestamp_ms' }).notNull().default(ahora),
  actualizadoEn: integer('actualizado_en', { mode: 'timestamp_ms' }).notNull().default(ahora),
});

export const exercises = sqliteTable(
  'exercises',
  {
    id: text('id').primaryKey(),
    userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }),
    nombre: text('nombre').notNull(),
    musculoPrincipal: text('musculo_principal', { enum: MUSCULOS }).notNull(),
    musculosSecundarios: text('musculos_secundarios', { mode: 'json' })
      .$type<Musculo[]>()
      .notNull()
      .default([]),
    equipamiento: text('equipamiento', { enum: EQUIPAMIENTOS }).notNull(),
    unilateral: integer('unilateral', { mode: 'boolean' }).notNull().default(false),
    visibilidad: text('visibilidad', { enum: VISIBILIDADES }).notNull().default('privado'),
    version: integer('version').notNull().default(1),
    creadoEn: integer('creado_en', { mode: 'timestamp_ms' }).notNull().default(ahora),
    actualizadoEn: integer('actualizado_en', { mode: 'timestamp_ms' }).notNull().default(ahora),
  },
  (t) => [index('exercises_musculo_principal_idx').on(t.musculoPrincipal)],
);

export type User = typeof users.$inferSelect;
export type NuevoUser = typeof users.$inferInsert;
export type Exercise = typeof exercises.$inferSelect;
export type NuevoExercise = typeof exercises.$inferInsert;
