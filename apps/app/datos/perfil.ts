import type { Compromiso, Objetivo } from '@ablaze/db';
import { profiles, type Profile } from '@ablaze/db/sqlite';
import { eq } from 'drizzle-orm';

import { abrirBaseLocal } from '../basededatos/index.ts';
import { USUARIO_LOCAL_ID } from '../basededatos/sembrar.ts';

/**
 * El perfil que llena el onboarding. Una fila por usuario, casi toda nulable:
 * varias pantallas se pueden saltar y un perfil a medias es un estado válido.
 */

/** Lo que se puede escribir desde las pantallas del onboarding. */
export type CambiosDePerfil = Partial<{
  objetivos: Objetivo[];
  compromiso: Compromiso;
}>;

export async function leerPerfil(): Promise<Profile | null> {
  const { db } = await abrirBaseLocal();
  const [fila] = await db.select().from(profiles).where(eq(profiles.userId, USUARIO_LOCAL_ID));
  return fila ?? null;
}

/** Devuelve el perfil, creándolo vacío la primera vez. */
export async function asegurarPerfil(): Promise<Profile> {
  const existente = await leerPerfil();
  if (existente) return existente;

  const { db } = await abrirBaseLocal();
  await db
    .insert(profiles)
    .values({ id: crypto.randomUUID(), userId: USUARIO_LOCAL_ID })
    .onConflictDoNothing();

  const creado = await leerPerfil();
  if (!creado) throw new Error('No se pudo crear el perfil local.');
  return creado;
}

/**
 * Guarda lo de una pantalla y anota hasta dónde se llegó.
 *
 * Se llama al SALIR de cada paso, no al terminar el onboarding entero. Son
 * dieciséis pantallas: si cerrar la app obligase a empezar de cero, el
 * onboarding sería el primer motivo de abandono, antes incluso de haber
 * entrenado una vez.
 *
 * `paso` solo sube. Volver atrás a corregir algo no debe hacer que la app crea
 * que el usuario está más atrás de lo que está.
 */
export async function guardarPaso(paso: number, cambios: CambiosDePerfil = {}): Promise<void> {
  const perfil = await asegurarPerfil();
  const { db } = await abrirBaseLocal();

  await db
    .update(profiles)
    .set({
      ...cambios,
      onboardingPaso: Math.max(perfil.onboardingPaso, paso),
      actualizadoEn: new Date(),
    })
    .where(eq(profiles.userId, USUARIO_LOCAL_ID));
}

/** Cierra el onboarding. A partir de aquí la app abre en el inicio, no en la bienvenida. */
export async function terminarOnboarding(): Promise<void> {
  const { db } = await abrirBaseLocal();
  await db
    .update(profiles)
    .set({ onboardingCompletadoEn: new Date(), actualizadoEn: new Date() })
    .where(eq(profiles.userId, USUARIO_LOCAL_ID));
}
