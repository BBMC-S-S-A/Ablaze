/**
 * La llama: la constancia hecha imagen.
 *
 * Se alimenta de semanas cumplidas contra lo planeado, no de días seguidos. El
 * descanso planificado no la afecta: descansar es parte de entrenar, y un
 * sistema que castiga el descanso enseña a entrenar mal.
 *
 * ---
 *
 * **Una ambigüedad del documento, resuelta aquí a propósito.** La regla 3 dice
 * que la llama «baja gradualmente durante semanas» y la 4 que «alcanzado un
 * nivel, ese nivel es el piso». Las dos juntas no pueden ser ciertas: si el
 * nivel alcanzado es el piso, no baja nunca. Y el ejemplo de la regla 4 —
 * «puede desaparecer tres meses y encontrar una brasa esperándolo» — describe a
 * alguien que vuelve a un nivel más bajo del que tenía.
 *
 * Lo que se implementa: **el piso es un nivel por debajo del más alto
 * alcanzado, y nunca por debajo de Chispa.** Así la llama sí baja, no se apaga,
 * y quien llegó a Llama encuentra una Brasa al volver. Si la intención era otra,
 * se cambia aquí y en las pruebas, que es todo lo que hay que tocar.
 */

/** Los cinco niveles. El índice del arreglo más uno es el número de nivel. */
export const NIVELES = ['chispa', 'brasa', 'llama', 'hoguera', 'incendio'] as const;
export type NombreDeNivel = (typeof NIVELES)[number];

/**
 * Semanas cumplidas acumuladas que hacen falta para cada nivel.
 *
 * Salen de los plazos del documento leídos como semanas de constancia: un mes
 * para Brasa, dos para Llama, tres para Hoguera y seis para Incendio.
 */
export const UMBRALES = [0, 4, 8, 12, 26] as const;

export type SemanaDeLlama = {
  /** Lunes de la semana, AAAA-MM-DD. */
  semanaInicio: string;
  sesionesPlaneadas: number;
  sesionesCumplidas: number;
  /** Días de descanso que estaban en el plan. Una semana de descanso no baja nada. */
  descansosPlaneados: number;
};

export type ResultadoDeSemana = 'cumplida' | 'mantenida' | 'bajada';

export type EstadoDeLlama = {
  nivel: number;
  nombre: NombreDeNivel;
  /** El más alto que se alcanzó alguna vez. De aquí sale lo desbloqueado. */
  nivelPiso: number;
  /** Semanas cumplidas acumuladas. Es lo que sube y baja. */
  progreso: number;
  /** Cuántas semanas cumplidas faltan para el siguiente nivel. Null en el último. */
  semanasParaSubir: number | null;
};

/**
 * Cómo le fue a una semana.
 *
 * Solo una semana con cero sesiones baja la llama. Cumplir a medias la mantiene:
 * el documento dice que tres de cuatro mantienen, y no dice nada de una de
 * cuatro porque la aplicación no regaña. Hacer algo nunca puede ser peor que la
 * mitad de no hacer nada.
 */
export function evaluarSemana(semana: SemanaDeLlama): ResultadoDeSemana {
  const { sesionesPlaneadas: planeadas, sesionesCumplidas: hechas, descansosPlaneados } = semana;

  // Semana de descanso planificada: es parte del plan, no una falla.
  if (planeadas === 0 && descansosPlaneados > 0) return 'mantenida';

  // Sin plan y sin descanso declarado no hay nada contra qué medir.
  if (planeadas === 0) return 'mantenida';

  if (hechas >= planeadas) return 'cumplida';
  if (hechas === 0) return 'bajada';
  return 'mantenida';
}

function nivelDesdeProgreso(progreso: number): number {
  let nivel = 1;
  for (let i = 0; i < UMBRALES.length; i++) {
    if (progreso >= (UMBRALES[i] ?? 0)) nivel = i + 1;
  }
  return nivel;
}

/**
 * El estado de la llama a partir de todo el historial.
 *
 * Se recalcula entero desde las semanas y no se guarda solo el número final:
 * así, si la fórmula cambia, el historial no queda inservible.
 */
export function calcularLlama(semanas: SemanaDeLlama[]): EstadoDeLlama {
  const ordenadas = [...semanas].sort((a, b) => a.semanaInicio.localeCompare(b.semanaInicio));

  let progreso = 0;
  let nivelMasAlto = 1;

  for (const semana of ordenadas) {
    const resultado = evaluarSemana(semana);
    if (resultado === 'cumplida') progreso += 1;
    if (resultado === 'bajada') progreso -= 1;

    // El piso: un nivel por debajo del más alto alcanzado, nunca bajo Chispa.
    const pisoDeProgreso = UMBRALES[Math.max(0, nivelMasAlto - 2)] ?? 0;
    if (progreso < pisoDeProgreso) progreso = pisoDeProgreso;
    if (progreso < 0) progreso = 0;

    nivelMasAlto = Math.max(nivelMasAlto, nivelDesdeProgreso(progreso));
  }

  const nivel = nivelDesdeProgreso(progreso);
  const siguiente = UMBRALES[nivel];

  return {
    nivel,
    nombre: NIVELES[nivel - 1] ?? 'chispa',
    nivelPiso: Math.max(1, nivelMasAlto - 1),
    progreso,
    semanasParaSubir: siguiente === undefined ? null : Math.max(0, siguiente - progreso),
  };
}

/** Qué se abre en cada nivel. Los desbloqueos usan el piso, no el nivel actual. */
export const DESBLOQUEOS: Record<NombreDeNivel, string> = {
  chispa: 'La aplicación funciona completa desde aquí.',
  brasa: 'Comparador de fotos y primer recap mensual.',
  llama: 'Progresión por ejercicio y análisis de simetría.',
  hoguera: 'Proyección del cuerpo sobre tendencia real.',
  incendio: 'Recap trimestral, timelapse y materiales exclusivos.',
};
