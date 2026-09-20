import { sessions, type Session } from '@ablaze/db/sqlite';
import { and, desc, eq, isNull } from 'drizzle-orm';

import { abrirBaseLocal } from '../basededatos/index.ts';
import { USUARIO_LOCAL_ID } from '../basededatos/sembrar.ts';

/**
 * Una sesión es un entrenamiento concreto. Está separada de los bloques de
 * tiempo a propósito: se puede entrenar sin haberlo planeado, y esa sesión tiene
 * que poder existir igual.
 */

/** La que está abierta ahora mismo, si hay alguna. Abierta = sin hora de fin. */
export async function sesionEnCurso(): Promise<Session | null> {
  const { db } = await abrirBaseLocal();
  const [fila] = await db
    .select()
    .from(sessions)
    .where(and(eq(sessions.userId, USUARIO_LOCAL_ID), isNull(sessions.fin)))
    .orderBy(desc(sessions.inicio))
    .limit(1);
  return fila ?? null;
}

/**
 * Devuelve la sesión abierta o abre una nueva.
 *
 * Se llama al tocar el primer ejercicio, no desde un botón de «empezar
 * entrenamiento». En el gimnasio uno no declara que va a entrenar: se para
 * delante de una máquina y empieza.
 */
export async function asegurarSesion(): Promise<Session> {
  const abierta = await sesionEnCurso();
  if (abierta) return abierta;

  const { db } = await abrirBaseLocal();
  const id = crypto.randomUUID();
  await db.insert(sessions).values({ id, userId: USUARIO_LOCAL_ID, inicio: new Date() });

  const creada = await sesionEnCurso();
  if (!creada) throw new Error('No se pudo abrir la sesión.');
  return creada;
}

export async function terminarSesion(id: string): Promise<void> {
  const { db } = await abrirBaseLocal();
  await db
    .update(sessions)
    .set({ fin: new Date(), actualizadoEn: new Date() })
    .where(eq(sessions.id, id));
}

/** Descarta una sesión vacía. Abrirla por error no debería dejar basura en el historial. */
export async function descartarSesion(id: string): Promise<void> {
  const { db } = await abrirBaseLocal();
  await db.delete(sessions).where(eq(sessions.id, id));
}
