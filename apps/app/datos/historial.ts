import { exercises, sets } from '@ablaze/db/sqlite';
import { and, asc, eq } from 'drizzle-orm';

import { abrirBaseLocal } from '../basededatos/index.ts';
import { USUARIO_LOCAL_ID } from '../basededatos/sembrar.ts';

/**
 * El historial de un ejercicio y su progresión.
 *
 * Regla que manda aquí: **la curva no se enseña hasta que signifique algo.** Una
 * progresión con dos puntos es ruido, y dibujarla es prometer una tendencia que
 * no existe. El sistema no esconde la herramienta: dice cuántas sesiones faltan
 * para que tenga sentido.
 */

/** Por debajo de esto no hay tendencia, hay dos puntos y una raya entre ellos. */
export const SESIONES_PARA_LA_CURVA = 3;

export type DiaDeEntrenamiento = {
  sessionId: string;
  fecha: Date;
  series: number;
  repeticionesTotales: number;
  /** La serie más pesada del día. Es lo que la gente recuerda como «cuánto levanté». */
  mejorPesoKg: number | null;
  /** Kilos movidos ese día en este ejercicio. */
  volumen: number;
  /** Esfuerzo percibido medio del día, cuando se anotó. Es opcional al registrar. */
  esfuerzoMedio: number | null;
  /**
   * Una estimación de una repetición máxima con la fórmula de Epley. Sirve para
   * comparar días en los que se hicieron repeticiones distintas: 60×10 y 80×3
   * no se pueden comparar por el peso a secas.
   */
  estimadoUnaRepeticion: number | null;
};

export type Historial = {
  dias: DiaDeEntrenamiento[];
  /** Si no, la interfaz enseña cuántas faltan en vez de una curva engañosa. */
  hayTendencia: boolean;
  sesionesQueFaltan: number;
};

export async function historialDeEjercicio(exerciseId: string): Promise<Historial> {
  const { db } = await abrirBaseLocal();

  const filas = await db
    .select()
    .from(sets)
    .where(and(eq(sets.userId, USUARIO_LOCAL_ID), eq(sets.exerciseId, exerciseId)))
    .orderBy(asc(sets.completadaEn));

  const porSesion = new Map<string, DiaDeEntrenamiento>();
  const acumuladoDeEsfuerzo = new Map<string, number[]>();

  for (const serie of filas) {
    // Las de calentamiento quedan fuera: cuentan como trabajo hecho, no como
    // marca, y meterlas aplanaría la progresión hacia abajo.
    if (serie.calentamiento) continue;

    const dia = porSesion.get(serie.sessionId) ?? {
      sessionId: serie.sessionId,
      fecha: serie.completadaEn,
      series: 0,
      repeticionesTotales: 0,
      mejorPesoKg: null,
      volumen: 0,
      esfuerzoMedio: null,
      estimadoUnaRepeticion: null,
    };

    dia.series += 1;
    dia.repeticionesTotales += serie.repeticiones;
    dia.volumen += (serie.pesoKg ?? 0) * serie.repeticiones;
    if (serie.pesoKg !== null && (dia.mejorPesoKg === null || serie.pesoKg > dia.mejorPesoKg)) {
      dia.mejorPesoKg = serie.pesoKg;
    }

    const estimado = epley(serie.pesoKg, serie.repeticiones);
    if (estimado !== null && (dia.estimadoUnaRepeticion === null || estimado > dia.estimadoUnaRepeticion)) {
      dia.estimadoUnaRepeticion = estimado;
    }

    if (serie.esfuerzo !== null) {
      const esfuerzos = acumuladoDeEsfuerzo.get(serie.sessionId) ?? [];
      esfuerzos.push(serie.esfuerzo);
      acumuladoDeEsfuerzo.set(serie.sessionId, esfuerzos);
    }

    porSesion.set(serie.sessionId, dia);
  }

  for (const [sessionId, esfuerzos] of acumuladoDeEsfuerzo) {
    const dia = porSesion.get(sessionId);
    if (!dia || esfuerzos.length === 0) continue;
    const media = esfuerzos.reduce((a, b) => a + b, 0) / esfuerzos.length;
    dia.esfuerzoMedio = Math.round(media * 10) / 10;
  }

  const dias = [...porSesion.values()].sort((a, b) => a.fecha.getTime() - b.fecha.getTime());

  return {
    dias,
    hayTendencia: dias.length >= SESIONES_PARA_LA_CURVA,
    sesionesQueFaltan: Math.max(0, SESIONES_PARA_LA_CURVA - dias.length),
  };
}

/**
 * Epley: peso × (1 + repeticiones / 30).
 *
 * Es una estimación y se rotula como tal donde se enseñe. Pierde precisión por
 * encima de unas diez repeticiones, que es un límite conocido de la fórmula y no
 * un fallo del cálculo.
 */
function epley(pesoKg: number | null, repeticiones: number): number | null {
  if (pesoKg === null || pesoKg <= 0 || repeticiones < 1) return null;
  return Math.round(pesoKg * (1 + repeticiones / 30) * 10) / 10;
}

/** Cuánto cambió el estimado entre el primer día y el último, en por ciento. */
export function tendencia(historial: Historial): number | null {
  if (!historial.hayTendencia) return null;
  const conEstimado = historial.dias.filter((d) => d.estimadoUnaRepeticion !== null);
  const primero = conEstimado[0]?.estimadoUnaRepeticion;
  const ultimo = conEstimado[conEstimado.length - 1]?.estimadoUnaRepeticion;
  if (!primero || !ultimo) return null;
  return Math.round(((ultimo - primero) / primero) * 1000) / 10;
}

export type EjercicioEntrenado = { id: string; nombre: string; sesiones: number };

/**
 * Los ejercicios de los que hay algo que contar.
 *
 * El catálogo tiene 136; enseñarlos todos en una pantalla de progreso sería
 * pedirle al usuario que busque entre ciento treinta y seis gráficas vacías.
 */
export async function ejerciciosEntrenados(): Promise<EjercicioEntrenado[]> {
  const { db } = await abrirBaseLocal();
  const filas = await db
    .select({
      id: exercises.id,
      nombre: exercises.nombre,
      sessionId: sets.sessionId,
    })
    .from(sets)
    .innerJoin(exercises, eq(sets.exerciseId, exercises.id))
    .where(eq(sets.userId, USUARIO_LOCAL_ID));

  const porEjercicio = new Map<string, { nombre: string; sesiones: Set<string> }>();
  for (const fila of filas) {
    const actual = porEjercicio.get(fila.id) ?? { nombre: fila.nombre, sesiones: new Set<string>() };
    actual.sesiones.add(fila.sessionId);
    porEjercicio.set(fila.id, actual);
  }

  return [...porEjercicio.entries()]
    .map(([id, datos]) => ({ id, nombre: datos.nombre, sesiones: datos.sesiones.size }))
    .sort((a, b) => b.sesiones - a.sesiones);
}
