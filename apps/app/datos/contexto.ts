import type { Contexto } from '@ablaze/reglas';
import { injuries, sessions } from '@ablaze/db/sqlite';
import { and, desc, eq, gte, isNotNull } from 'drizzle-orm';

import { abrirBaseLocal } from '../basededatos/index.ts';
import { USUARIO_LOCAL_ID } from '../basededatos/sembrar.ts';
import { volumenPorGrupo } from './analisis.ts';
import { ejerciciosEntrenados, historialDeEjercicio } from './historial.ts';

/**
 * Reúne lo que el motor de reglas necesita saber.
 *
 * El motor es puro: no toca la base. Esta es la única capa que traduce entre las
 * tablas y las reglas, y por eso es también el único sitio donde hay que mirar
 * si una sugerencia sale con datos raros.
 */
export async function construirContexto(): Promise<Contexto> {
  const { db } = await abrirBaseLocal();
  const haceUnaSemana = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [grupos, entrenados, molestiasActivas, sesiones] = await Promise.all([
    volumenPorGrupo(7),
    ejerciciosEntrenados(),
    db
      .select()
      .from(injuries)
      .where(and(eq(injuries.userId, USUARIO_LOCAL_ID), eq(injuries.activa, true))),
    db
      .select({ id: sessions.id })
      .from(sessions)
      .where(
        and(
          eq(sessions.userId, USUARIO_LOCAL_ID),
          isNotNull(sessions.fin),
          gte(sessions.inicio, haceUnaSemana),
        ),
      ),
  ]);

  // Solo los que tienen historial suficiente para que el estancamiento
  // signifique algo; cargar los 136 sería pedir 136 consultas para nada.
  const candidatos = entrenados.filter((e) => e.sesiones >= 2).slice(0, 12);
  const ejercicios = await Promise.all(
    candidatos.map(async (e) => {
      const historial = await historialDeEjercicio(e.id);
      return {
        exerciseId: e.id,
        nombre: e.nombre,
        sesiones: historial.dias.map((d) => ({
          fecha: d.fecha,
          mejorPesoKg: d.mejorPesoKg,
          repeticionesTotales: d.repeticionesTotales,
        })),
      };
    }),
  );

  return {
    grupos,
    ejercicios,
    molestias: molestiasActivas.map((m) => ({ zona: m.zona, lado: m.lado, activa: m.activa })),
    sesionesEstaSemana: sesiones.length,
    // Null a propósito: nadie ha planificado nada todavía. La regla de
    // adherencia lo detecta y dice qué falta en vez de inventarse un objetivo.
    sesionesPlaneadas: null,
  };
}

export type Asistencia = {
  diasEsteMes: number;
  diasEsteAno: number;
  ultimoEntrenamiento: Date | null;
};

/**
 * Cuántos días se fue al gimnasio.
 *
 * Días distintos, no sesiones: entrenar dos veces un martes es un día, no dos.
 * Cuenta solo las sesiones cerradas, porque una abierta todavía puede
 * descartarse.
 */
export async function asistencia(): Promise<Asistencia> {
  const { db } = await abrirBaseLocal();
  const ahora = new Date();
  const inicioDelAno = new Date(ahora.getFullYear(), 0, 1);

  const filas = await db
    .select({ inicio: sessions.inicio })
    .from(sessions)
    .where(
      and(
        eq(sessions.userId, USUARIO_LOCAL_ID),
        isNotNull(sessions.fin),
        gte(sessions.inicio, inicioDelAno),
      ),
    )
    .orderBy(desc(sessions.inicio));

  const diasDelAno = new Set<string>();
  const diasDelMes = new Set<string>();

  for (const fila of filas) {
    const clave = fila.inicio.toISOString().slice(0, 10);
    diasDelAno.add(clave);
    if (fila.inicio.getMonth() === ahora.getMonth()) diasDelMes.add(clave);
  }

  return {
    diasEsteMes: diasDelMes.size,
    diasEsteAno: diasDelAno.size,
    ultimoEntrenamiento: filas[0]?.inicio ?? null,
  };
}
