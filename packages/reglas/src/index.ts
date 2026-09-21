import type { Musculo, ZonaDelCuerpo } from '@ablaze/db';

/**
 * El motor de sugerencias.
 *
 * Funciones puras: entran datos, sale una lista de sugerencias. No consultan la
 * base, no miran el reloj por su cuenta y no llaman a ningún modelo de lenguaje.
 * Eso es lo que las hace comprobables una por una, y lo que permite que cada
 * sugerencia venga con su razón sin tener que inventarla después.
 *
 * Tres reglas sobre las reglas:
 *
 * 1. **Si faltan datos, no se sugiere.** Se devuelve qué falta. Una
 *    recomendación sobre dos semanas de historial se equivoca, y cuando se
 *    equivoca el usuario deja de creerle al sistema para siempre.
 * 2. **Toda sugerencia lleva su razón en una frase**, con los números que la
 *    sostienen.
 * 3. **Ninguna regaña.** Se describe lo que pasa y se propone qué hacer; no se
 *    juzga a quien falló.
 */

export type Sugerencia = {
  /** Estable, para poder silenciar una sin silenciar el resto. */
  regla: string;
  titulo: string;
  /** Por qué se dice esto, con los números detrás. Se enseña siempre. */
  razon: string;
  prioridad: 'alta' | 'normal' | 'baja';
};

export type DatosQueFaltan = {
  regla: string;
  /** Qué hace falta, dicho para una persona, no para un programador. */
  falta: string;
};

export type Resultado = {
  sugerencias: Sugerencia[];
  faltantes: DatosQueFaltan[];
};

// --- Lo que las reglas necesitan saber ------------------------------------

export type EstadoDeGrupo = {
  musculo: Musculo;
  /** Horas desde la última serie que lo trabajó. Null si no hay registro. */
  horasDesde: number | null;
  kilos: number;
  series: number;
};

export type RegistroDeEjercicio = {
  exerciseId: string;
  nombre: string;
  /** Un punto por sesión, de la más vieja a la más nueva. */
  sesiones: { fecha: Date; mejorPesoKg: number | null; repeticionesTotales: number }[];
};

export type Molestia = { zona: ZonaDelCuerpo; lado: string; activa: boolean };

export type Contexto = {
  /** Los dieciséis grupos, con su estado de los últimos días. */
  grupos: EstadoDeGrupo[];
  ejercicios: RegistroDeEjercicio[];
  molestias: Molestia[];
  /** Sesiones registradas en los últimos siete días. */
  sesionesEstaSemana: number;
  /** Cuántas dijo el usuario que quiere hacer. Null mientras no se planifique. */
  sesionesPlaneadas: number | null;
};

const NOMBRES: Record<Musculo, string> = {
  pecho: 'pecho',
  espalda: 'espalda',
  hombros: 'hombros',
  biceps: 'bíceps',
  triceps: 'tríceps',
  antebrazos: 'antebrazos',
  trapecio: 'trapecio',
  abdomen: 'abdomen',
  oblicuos: 'oblicuos',
  lumbares: 'lumbares',
  gluteos: 'glúteos',
  aductores: 'aductores',
  cuadriceps: 'cuádriceps',
  isquiotibiales: 'isquiotibiales',
  gemelos: 'gemelos',
  cuello: 'cuello',
};

// --- Reglas ---------------------------------------------------------------

/** Cuántas sesiones iguales seguidas cuentan como estancamiento. */
export const SESIONES_PARA_ESTANCAMIENTO = 3;

/** A partir de qué desproporción entre empuje y tirón se avisa. */
export const DESPROPORCION_MAXIMA = 2;

/**
 * Qué toca hoy: el grupo que lleva más tiempo sin trabajarse.
 *
 * Solo mira grupos que alguna vez se entrenaron. Proponer «cuello» porque nunca
 * se ha tocado sería cierto y completamente inútil.
 */
export function reglaGrupoMasDescansado(contexto: Contexto): Sugerencia | DatosQueFaltan {
  const regla = 'grupo-mas-descansado';
  const conHistorial = contexto.grupos.filter((g) => g.horasDesde !== null);

  if (conHistorial.length === 0) {
    return { regla, falta: 'Registra algún entrenamiento para saber qué tienes descansado.' };
  }

  const candidato = conHistorial.reduce((a, b) =>
    (b.horasDesde ?? 0) > (a.horasDesde ?? 0) ? b : a,
  );
  const horas = candidato.horasDesde ?? 0;

  if (horas < 48) {
    return { regla, falta: 'Todo lo que entrenas lleva menos de 48 horas de descanso.' };
  }

  const dias = Math.floor(horas / 24);
  return {
    regla,
    titulo: `Hoy te cuadra ${NOMBRES[candidato.musculo]}`,
    razon:
      dias >= 1
        ? `Llevas ${dias} ${dias === 1 ? 'día' : 'días'} sin trabajarlo, más que cualquier otro grupo.`
        : `Llevas ${horas} horas sin trabajarlo, más que cualquier otro grupo.`,
    prioridad: 'normal',
  };
}

/**
 * Un ejercicio que lleva varias sesiones con el mismo peso.
 *
 * No dice que esté mal: estancarse es parte de entrenar. Dice que pasó, con el
 * número de sesiones, y deja la decisión a quien entrena.
 */
export function reglaEstancamiento(contexto: Contexto): Sugerencia | DatosQueFaltan {
  const regla = 'estancamiento';

  const conSuficiente = contexto.ejercicios.filter(
    (e) => e.sesiones.length >= SESIONES_PARA_ESTANCAMIENTO,
  );
  if (conSuficiente.length === 0) {
    return {
      regla,
      falta: `Hacen falta ${SESIONES_PARA_ESTANCAMIENTO} sesiones del mismo ejercicio para poder hablar de estancamiento.`,
    };
  }

  for (const ejercicio of conSuficiente) {
    const ultimas = ejercicio.sesiones.slice(-SESIONES_PARA_ESTANCAMIENTO);
    const pesos = ultimas.map((s) => s.mejorPesoKg);
    if (pesos.some((p) => p === null)) continue;

    const todosIguales = pesos.every((p) => p === pesos[0]);
    if (!todosIguales) continue;

    return {
      regla,
      titulo: `${ejercicio.nombre} lleva ${SESIONES_PARA_ESTANCAMIENTO} sesiones en el mismo peso`,
      razon: `Las últimas ${SESIONES_PARA_ESTANCAMIENTO} fueron a ${pesos[0]} kg. Subir el peso o las repeticiones es la forma de que vuelva a moverse.`,
      prioridad: 'normal',
    };
  }

  return { regla, falta: 'Ningún ejercicio lleva suficientes sesiones repitiendo el mismo peso.' };
}

/**
 * Desproporción entre lo que empuja y lo que tira.
 *
 * Es el desequilibrio más común y el que más se nota en el hombro. Se mide por
 * volumen, no por número de ejercicios: cuatro series de press pesan más que
 * cuatro de face pull.
 */
export function reglaEmpujeTiron(contexto: Contexto): Sugerencia | DatosQueFaltan {
  const regla = 'empuje-tiron';

  const kilos = (musculos: Musculo[]) =>
    contexto.grupos.filter((g) => musculos.includes(g.musculo)).reduce((t, g) => t + g.kilos, 0);

  const empuje = kilos(['pecho', 'hombros', 'triceps']);
  const tiron = kilos(['espalda', 'biceps', 'trapecio']);

  if (empuje === 0 && tiron === 0) {
    return { regla, falta: 'Todavía no hay volumen de empuje ni de tirón esta semana.' };
  }

  // Con un solo lado a cero no hay proporción que calcular, pero sí hay algo que
  // decir: falta la mitad del trabajo.
  if (tiron === 0) {
    return {
      regla,
      titulo: 'Esta semana solo has empujado',
      razon: `${Math.round(empuje)} kg de empuje y nada de tirón. Espalda y bíceps equilibran el hombro.`,
      prioridad: 'alta',
    };
  }
  if (empuje === 0) {
    return {
      regla,
      titulo: 'Esta semana solo has tirado',
      razon: `${Math.round(tiron)} kg de tirón y nada de empuje.`,
      prioridad: 'normal',
    };
  }

  const proporcion = empuje / tiron;
  if (proporcion <= DESPROPORCION_MAXIMA) {
    return { regla, falta: 'El empuje y el tirón están equilibrados esta semana.' };
  }

  return {
    regla,
    titulo: 'Estás empujando bastante más de lo que tiras',
    razon: `${Math.round(empuje)} kg de empuje contra ${Math.round(tiron)} kg de tirón, algo más del ${Math.round(proporcion)} a 1.`,
    prioridad: 'alta',
  };
}

/**
 * Molestias activas.
 *
 * No diagnostica ni propone tratamiento: recuerda que están ahí para que el
 * plan las tenga en cuenta. La aplicación educa, nunca diagnostica.
 */
export function reglaMolestias(contexto: Contexto): Sugerencia | DatosQueFaltan {
  const regla = 'molestias';
  const activas = contexto.molestias.filter((m) => m.activa);

  if (activas.length === 0) {
    return { regla, falta: 'No tienes ninguna molestia marcada como activa.' };
  }

  const zonas = [...new Set(activas.map((m) => m.zona.replace(/_/g, ' ')))];
  return {
    regla,
    titulo: zonas.length === 1 ? `Sigue marcada la molestia en ${zonas[0]}` : 'Tienes molestias marcadas',
    razon: `${zonas.join(', ')}. Los ejercicios que carguen esa zona quedan fuera de lo que se te propone hasta que la desmarques.`,
    prioridad: 'alta',
  };
}

/** Cómo va la semana contra lo que se planeó. */
export function reglaAdherencia(contexto: Contexto): Sugerencia | DatosQueFaltan {
  const regla = 'adherencia';

  if (contexto.sesionesPlaneadas === null) {
    return {
      regla,
      falta: 'Hace falta saber cuántas sesiones planeas a la semana. Eso llega con Tu semana.',
    };
  }

  const { sesionesEstaSemana: hechas, sesionesPlaneadas: planeadas } = contexto;

  if (hechas >= planeadas) {
    return {
      regla,
      titulo: 'Semana cumplida',
      razon: `${hechas} de ${planeadas} sesiones. La llama sube por semana cumplida, no por día asistido.`,
      prioridad: 'normal',
    };
  }

  const faltan = planeadas - hechas;
  return {
    regla,
    titulo: `Te ${faltan === 1 ? 'queda' : 'quedan'} ${faltan} ${faltan === 1 ? 'sesión' : 'sesiones'} esta semana`,
    razon: `Llevas ${hechas} de ${planeadas}.`,
    prioridad: 'normal',
  };
}

const REGLAS = [
  reglaMolestias,
  reglaEmpujeTiron,
  reglaAdherencia,
  reglaGrupoMasDescansado,
  reglaEstancamiento,
] as const;

const ORDEN: Record<Sugerencia['prioridad'], number> = { alta: 0, normal: 1, baja: 2 };

function esSugerencia(x: Sugerencia | DatosQueFaltan): x is Sugerencia {
  return 'titulo' in x;
}

/** Corre todas las reglas y separa lo que se puede decir de lo que falta por saber. */
export function evaluar(contexto: Contexto): Resultado {
  const sugerencias: Sugerencia[] = [];
  const faltantes: DatosQueFaltan[] = [];

  for (const regla of REGLAS) {
    const salida = regla(contexto);
    if (esSugerencia(salida)) sugerencias.push(salida);
    else faltantes.push(salida);
  }

  sugerencias.sort((a, b) => ORDEN[a.prioridad] - ORDEN[b.prioridad]);
  return { sugerencias, faltantes };
}
export * from './ventanas.ts';
