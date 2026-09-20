import { exercises, sets, type Set } from '@ablaze/db/sqlite';
import { and, asc, desc, eq, ne } from 'drizzle-orm';

import { abrirBaseLocal } from '../basededatos/index.ts';
import { USUARIO_LOCAL_ID } from '../basededatos/sembrar.ts';

/**
 * Las series. Es la tabla que más crece y de la que sale toda la progresión, así
 * que aquí no se guarda nada derivado: solo lo que de verdad pasó.
 */

export type SerieConEjercicio = Set & { nombreDelEjercicio: string };

/** Todas las series de una sesión, en el orden en que se hicieron. */
export async function seriesDeLaSesion(sessionId: string): Promise<SerieConEjercicio[]> {
  const { db } = await abrirBaseLocal();
  const filas = await db
    .select()
    .from(sets)
    .innerJoin(exercises, eq(sets.exerciseId, exercises.id))
    .where(eq(sets.sessionId, sessionId))
    .orderBy(asc(sets.orden));

  return filas.map((f) => ({ ...f.sets, nombreDelEjercicio: f.exercises.nombre }));
}

/** Las de un ejercicio dentro de esta sesión. Es lo que se ve mientras se entrena. */
export async function seriesDelEjercicio(
  sessionId: string,
  exerciseId: string,
): Promise<Set[]> {
  const { db } = await abrirBaseLocal();
  return db
    .select()
    .from(sets)
    .where(and(eq(sets.sessionId, sessionId), eq(sets.exerciseId, exerciseId)))
    .orderBy(asc(sets.orden));
}

/**
 * La última serie que se hizo de este ejercicio en un entrenamiento anterior.
 *
 * Es lo que precarga el peso y las repeticiones. Sin esto, registrar una serie
 * sería teclear dos números con las manos sudadas entre descansos, y la gente
 * deja de hacerlo a la tercera semana.
 *
 * `exceptoSesionId` deja fuera el entrenamiento en curso a propósito: «la última
 * vez» tiene que significar el día anterior, no la serie que se acaba de anotar
 * hace treinta segundos. Dentro de la sesión, la continuidad la da el propio
 * contador, que se queda donde lo dejaste.
 */
export async function ultimaSerieDe(
  exerciseId: string,
  exceptoSesionId?: string,
): Promise<Set | null> {
  const { db } = await abrirBaseLocal();
  const condiciones = [eq(sets.userId, USUARIO_LOCAL_ID), eq(sets.exerciseId, exerciseId)];
  if (exceptoSesionId) condiciones.push(ne(sets.sessionId, exceptoSesionId));

  const [fila] = await db
    .select()
    .from(sets)
    .where(and(...condiciones))
    .orderBy(desc(sets.completadaEn))
    .limit(1);
  return fila ?? null;
}

export type SerieNueva = {
  sessionId: string;
  exerciseId: string;
  repeticiones: number;
  pesoKg: number | null;
  esfuerzo?: number | null;
  calentamiento?: boolean;
};

export async function registrarSerie(datos: SerieNueva): Promise<void> {
  if (!Number.isFinite(datos.repeticiones) || datos.repeticiones < 1) {
    throw new Error('Una serie necesita al menos una repetición.');
  }

  const { db } = await abrirBaseLocal();

  // El orden es dentro de la sesión, no del ejercicio: así el historial
  // reconstruye en qué secuencia real se entrenó, incluso alternando ejercicios.
  const [ultima] = await db
    .select({ orden: sets.orden })
    .from(sets)
    .where(eq(sets.sessionId, datos.sessionId))
    .orderBy(desc(sets.orden))
    .limit(1);

  await db.insert(sets).values({
    id: crypto.randomUUID(),
    userId: USUARIO_LOCAL_ID,
    sessionId: datos.sessionId,
    exerciseId: datos.exerciseId,
    orden: (ultima?.orden ?? 0) + 1,
    repeticiones: datos.repeticiones,
    pesoKg: datos.pesoKg,
    esfuerzo: datos.esfuerzo ?? null,
    calentamiento: datos.calentamiento ?? false,
    completadaEn: new Date(),
  });
}

/** Corregir lo que se anotó mal, sin borrar y volver a escribir. */
export async function corregirSerie(
  id: string,
  cambios: Partial<Pick<Set, 'repeticiones' | 'pesoKg' | 'esfuerzo' | 'calentamiento'>>,
): Promise<void> {
  const { db } = await abrirBaseLocal();
  await db
    .update(sets)
    .set({ ...cambios, actualizadoEn: new Date() })
    .where(eq(sets.id, id));
}

export async function borrarSerie(id: string): Promise<void> {
  const { db } = await abrirBaseLocal();
  await db.delete(sets).where(eq(sets.id, id));
}
