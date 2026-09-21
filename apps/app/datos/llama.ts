import { flameLog, sessions } from '@ablaze/db/sqlite';
import { calcularLlama, type EstadoDeLlama, type SemanaDeLlama } from '@ablaze/reglas';
import { and, eq, isNotNull } from 'drizzle-orm';

import { abrirBaseLocal } from '../basededatos/index.ts';
import { USUARIO_LOCAL_ID } from '../basededatos/sembrar.ts';
import { bloquesDeLaSemana, lunesDeLaSemana, sesionesPlaneadas } from './bloques.ts';

/**
 * La llama, semana a semana.
 *
 * Se recalcula entero desde las sesiones y los bloques, y se guarda cada semana
 * con sus planeadas y sus cumplidas. **Nunca solo el número final**: si mañana
 * cambia la fórmula, con el historial guardado se recalcula, y con solo el nivel
 * no se puede.
 */

function claveDeSemana(lunes: Date): string {
  // Fecha local, no UTC: toISOString sobre un lunes a las 00:00 en Colombia da
  // el domingo anterior, y la semana entera se desplazaría un día.
  const y = lunes.getFullYear();
  const m = String(lunes.getMonth() + 1).padStart(2, '0');
  const d = String(lunes.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Reconstruye las semanas desde el primer entrenamiento hasta hoy.
 *
 * Las sesiones planeadas de una semana pasada salen de los bloques que ya
 * existían entonces, no del plan de hoy: pintar hoy el horario no puede hacer
 * que el mes pasado aparezca como incumplido.
 */
export async function semanasDeLlama(): Promise<SemanaDeLlama[]> {
  const { db } = await abrirBaseLocal();

  const cerradas = await db
    .select({ inicio: sessions.inicio })
    .from(sessions)
    .where(and(eq(sessions.userId, USUARIO_LOCAL_ID), isNotNull(sessions.fin)));

  const estaSemana = lunesDeLaSemana(new Date());
  const primera = cerradas.length
    ? lunesDeLaSemana(
        cerradas.reduce((a, b) => (b.inicio < a.inicio ? b : a)).inicio,
      )
    : estaSemana;

  const semanas: SemanaDeLlama[] = [];

  for (const lunes = new Date(primera); lunes <= estaSemana; lunes.setDate(lunes.getDate() + 7)) {
    const domingo = new Date(lunes);
    domingo.setDate(domingo.getDate() + 7);

    const cumplidas = new Set(
      cerradas
        .filter((s) => s.inicio >= lunes && s.inicio < domingo)
        .map((s) => s.inicio.toDateString()),
    ).size;

    const planeadas = sesionesPlaneadas(await bloquesDeLaSemana(new Date(lunes)));

    semanas.push({
      semanaInicio: claveDeSemana(lunes),
      sesionesPlaneadas: planeadas,
      sesionesCumplidas: cumplidas,
      // Todavía no hay forma de declarar una semana de descanso; llega con la
      // planificación. Mientras tanto queda en cero y no resta.
      descansosPlaneados: 0,
    });
  }

  return semanas;
}

export type LlamaConHistorial = EstadoDeLlama & { semanas: SemanaDeLlama[] };

/** Calcula la llama y deja cada semana guardada en flame_log. */
export async function recalcularLlama(): Promise<LlamaConHistorial> {
  const semanas = await semanasDeLlama();
  const estado = calcularLlama(semanas);

  const { db } = await abrirBaseLocal();
  for (const semana of semanas) {
    const [existente] = await db
      .select({ id: flameLog.id })
      .from(flameLog)
      .where(
        and(eq(flameLog.userId, USUARIO_LOCAL_ID), eq(flameLog.semanaInicio, semana.semanaInicio)),
      );

    const fila = {
      sesionesPlaneadas: semana.sesionesPlaneadas,
      sesionesCumplidas: semana.sesionesCumplidas,
      descansosPlaneados: semana.descansosPlaneados,
      nivel: estado.nivel,
      nivelPiso: estado.nivelPiso,
      actualizadoEn: new Date(),
    };

    if (existente) {
      await db.update(flameLog).set(fila).where(eq(flameLog.id, existente.id));
    } else {
      await db.insert(flameLog).values({
        id: crypto.randomUUID(),
        userId: USUARIO_LOCAL_ID,
        semanaInicio: semana.semanaInicio,
        ...fila,
      });
    }
  }

  return { ...estado, semanas };
}
