import type { Musculo } from '@ablaze/db';
import { MUSCULOS } from '@ablaze/db';
import { exercises, sets } from '@ablaze/db/sqlite';
import { and, eq, gte } from 'drizzle-orm';

import { abrirBaseLocal } from '../basededatos/index.ts';
import { USUARIO_LOCAL_ID } from '../basededatos/sembrar.ts';

/**
 * Volumen por grupo y cuánto lleva descansado cada uno.
 *
 * De aquí salen la replanificación, la rutina conjunta con parceros y el
 * personaje como menú. Todo se calcula desde `sets` y el catálogo clasificado:
 * no se guarda ningún número derivado, porque un derivado guardado es un
 * derivado que se queda desactualizado.
 */

/**
 * Cuánto cuenta un músculo secundario frente al principal.
 *
 * El press de banca trabaja tríceps, pero no como un press francés. Contarlos
 * igual inflaría el volumen de tríceps hasta volverlo inútil; no contarlos diría
 * que están descansados cuando no lo están. La mitad es una convención razonable,
 * no una medida: si algún día hay datos para afinarla, se afina aquí.
 */
const PESO_DEL_SECUNDARIO = 0.5;

export type VolumenDeGrupo = {
  musculo: Musculo;
  /** Kilos movidos: peso por repeticiones, ponderado. */
  kilos: number;
  series: number;
  /** Horas desde la última serie que lo trabajó. Null si nunca. */
  horasDesde: number | null;
};

type FilaDeSerie = {
  pesoKg: number | null;
  repeticiones: number;
  completadaEn: Date;
  musculoPrincipal: Musculo;
  musculosSecundarios: Musculo[];
};

async function seriesRecientes(dias: number): Promise<FilaDeSerie[]> {
  const { db } = await abrirBaseLocal();
  const desde = new Date(Date.now() - dias * 24 * 60 * 60 * 1000);

  const filas = await db
    .select({
      pesoKg: sets.pesoKg,
      repeticiones: sets.repeticiones,
      completadaEn: sets.completadaEn,
      musculoPrincipal: exercises.musculoPrincipal,
      musculosSecundarios: exercises.musculosSecundarios,
    })
    .from(sets)
    .innerJoin(exercises, eq(sets.exerciseId, exercises.id))
    .where(and(eq(sets.userId, USUARIO_LOCAL_ID), gte(sets.completadaEn, desde)));

  return filas;
}

/**
 * Volumen y descanso de cada grupo en los últimos `dias`.
 *
 * Devuelve los dieciséis siempre, incluso los que están a cero: saber qué NO se
 * ha trabajado es justo el punto.
 */
export async function volumenPorGrupo(dias = 7): Promise<VolumenDeGrupo[]> {
  const filas = await seriesRecientes(dias);
  const ahora = Date.now();

  const acumulado = new Map<Musculo, { kilos: number; series: number; ultima: number | null }>();
  for (const musculo of MUSCULOS) acumulado.set(musculo, { kilos: 0, series: 0, ultima: null });

  for (const fila of filas) {
    // Sin peso —peso corporal— el volumen en kilos no significa nada, pero la
    // serie sí cuenta y el músculo sí quedó estimulado.
    const kilos = (fila.pesoKg ?? 0) * fila.repeticiones;
    const momento = fila.completadaEn.getTime();

    const aplicar = (musculo: Musculo, factor: number) => {
      const actual = acumulado.get(musculo);
      if (!actual) return;
      actual.kilos += kilos * factor;
      actual.series += factor;
      actual.ultima = actual.ultima === null ? momento : Math.max(actual.ultima, momento);
    };

    aplicar(fila.musculoPrincipal, 1);
    for (const secundario of fila.musculosSecundarios) aplicar(secundario, PESO_DEL_SECUNDARIO);
  }

  return MUSCULOS.map((musculo) => {
    const datos = acumulado.get(musculo);
    return {
      musculo,
      kilos: Math.round(datos?.kilos ?? 0),
      series: Number((datos?.series ?? 0).toFixed(1)),
      horasDesde:
        datos?.ultima == null ? null : Math.floor((ahora - datos.ultima) / (60 * 60 * 1000)),
    };
  });
}

/**
 * Los grupos listos para volver a entrenarse.
 *
 * El umbral son 48 horas, que es la convención habitual para hipertrofia. No es
 * una verdad médica y no pretende serlo: es un corte útil para proponer qué toca
 * hoy, y quien quiera otra cosa entrena lo que quiera.
 */
export async function gruposDescansados(horas = 48): Promise<VolumenDeGrupo[]> {
  const todos = await volumenPorGrupo(14);
  return todos
    .filter((g) => g.horasDesde === null || g.horasDesde >= horas)
    .sort((a, b) => (b.horasDesde ?? Infinity) - (a.horasDesde ?? Infinity));
}
