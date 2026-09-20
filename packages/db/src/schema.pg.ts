/**
 * Esquema de Postgres: la copia del servidor.
 *
 * El teléfono manda y la nube copia, así que esta base es un respaldo
 * sincronizado, no la fuente de verdad. Debe quedar equivalente a
 * schema.sqlite.ts columna por columna.
 *
 * Por ahora solo están users y exercises, lo mínimo para que el monorepo
 * comparta tipos de verdad. Las doce tablas del documento entran en su propia
 * tarea.
 */
import { boolean, index, integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { EQUIPAMIENTOS, MUSCULOS, VISIBILIDADES } from './domain.ts';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  nombre: text('nombre').notNull(),
  creadoEn: timestamp('creado_en', { withTimezone: true }).notNull().defaultNow(),
  actualizadoEn: timestamp('actualizado_en', { withTimezone: true }).notNull().defaultNow(),
});

export const exercises = pgTable(
  'exercises',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    // Nulo cuando es un ejercicio del catálogo base; con dueño cuando el
    // usuario se lo inventó. No hay límite de ejercicios personalizados.
    userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
    nombre: text('nombre').notNull(),
    musculoPrincipal: text('musculo_principal', { enum: MUSCULOS }).notNull(),
    musculosSecundarios: text('musculos_secundarios', { enum: MUSCULOS }).array().notNull().default([]),
    equipamiento: text('equipamiento', { enum: EQUIPAMIENTOS }).notNull(),
    unilateral: boolean('unilateral').notNull().default(false),
    visibilidad: text('visibilidad', { enum: VISIBILIDADES }).notNull().default('privado'),
    version: integer('version').notNull().default(1),
    creadoEn: timestamp('creado_en', { withTimezone: true }).notNull().defaultNow(),
    actualizadoEn: timestamp('actualizado_en', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('exercises_musculo_principal_idx').on(t.musculoPrincipal)],
);

export type User = typeof users.$inferSelect;
export type NuevoUser = typeof users.$inferInsert;
export type Exercise = typeof exercises.$inferSelect;
export type NuevoExercise = typeof exercises.$inferInsert;
