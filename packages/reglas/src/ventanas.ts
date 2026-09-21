/**
 * Las ventanas donde de verdad cabe entrenar.
 *
 * Es la mitad del producto que ninguna otra aplicación tiene: ningún rastreador
 * de gimnasio sabe que mañana hay parcial a las siete, y ningún calendario sabe
 * que hoy toca pierna. Esto cruza las dos cosas.
 *
 * Funciones puras sobre fechas. No consultan nada y no usan la hora del sistema:
 * el rango entra como parámetro para que las pruebas puedan fijar un día
 * concreto y no romperse a medianoche.
 */

export type BloqueOcupado = { inicio: Date; fin: Date };

export type Ventana = {
  inicio: Date;
  fin: Date;
  /** Minutos que dura el hueco de punta a punta. */
  minutos: number;
  /**
   * Los que quedan para entrenar de verdad, ya descontado el desplazamiento de
   * ida y vuelta. Una ventana de sesenta minutos con veinte de camino no es una
   * ventana de sesenta minutos.
   */
  minutosUtiles: number;
};

export type Opciones = {
  /** Cuánto dura la sesión que se quiere meter. */
  minutosDeSesion: number;
  /** Ida al gimnasio. Se descuenta dos veces. */
  minutosDeDesplazamiento?: number;
  /** Antes de esta hora no se considera hueco. 0 a 23. */
  horaMinima?: number;
  /** Después de esta hora tampoco. 1 a 24. */
  horaMaxima?: number;
};

const MINUTO = 60 * 1000;

/** Junta los bloques que se pisan para no contar dos veces el mismo tiempo ocupado. */
export function fusionar(bloques: BloqueOcupado[]): BloqueOcupado[] {
  const ordenados = [...bloques]
    .filter((b) => b.fin.getTime() > b.inicio.getTime())
    .sort((a, b) => a.inicio.getTime() - b.inicio.getTime());

  const fusionados: BloqueOcupado[] = [];
  for (const bloque of ordenados) {
    const ultimo = fusionados[fusionados.length - 1];
    // Se fusionan también los que solo se tocan: entre una clase que termina a
    // las 10 y un turno que empieza a las 10 no hay hueco de cero minutos, no
    // hay hueco.
    if (ultimo && bloque.inicio.getTime() <= ultimo.fin.getTime()) {
      if (bloque.fin.getTime() > ultimo.fin.getTime()) ultimo.fin = new Date(bloque.fin);
    } else {
      fusionados.push({ inicio: new Date(bloque.inicio), fin: new Date(bloque.fin) });
    }
  }
  return fusionados;
}

/** Los tramos utilizables de cada día del rango, según las horas de corte. */
function tramosDelRango(desde: Date, hasta: Date, horaMinima: number, horaMaxima: number) {
  const tramos: BloqueOcupado[] = [];
  const dia = new Date(desde.getFullYear(), desde.getMonth(), desde.getDate());

  while (dia.getTime() < hasta.getTime()) {
    const abre = new Date(dia);
    abre.setHours(horaMinima, 0, 0, 0);
    const cierra = new Date(dia);
    // horaMaxima 24 es medianoche del día siguiente, y tiene que ser medianoche
    // exacta: cerrar a las 23:59:59.999 daba ventanas de 18 horas que decían
    // terminar a las 23:00.
    if (horaMaxima >= 24) {
      cierra.setDate(cierra.getDate() + 1);
      cierra.setHours(0, 0, 0, 0);
    } else {
      cierra.setHours(horaMaxima, 0, 0, 0);
    }

    const inicio = new Date(Math.max(abre.getTime(), desde.getTime()));
    const fin = new Date(Math.min(cierra.getTime(), hasta.getTime()));
    if (fin.getTime() > inicio.getTime()) tramos.push({ inicio, fin });

    dia.setDate(dia.getDate() + 1);
  }
  return tramos;
}

/**
 * Los huecos donde cabe una sesión, dentro del rango y descontando lo ocupado.
 *
 * Devuelve solo los que sirven: un hueco de veinte minutos existe, pero
 * ofrecerlo como sitio donde entrenar es hacerle perder el tiempo a alguien.
 */
export function ventanasLibres(
  ocupado: BloqueOcupado[],
  desde: Date,
  hasta: Date,
  opciones: Opciones,
): Ventana[] {
  const {
    minutosDeSesion,
    minutosDeDesplazamiento = 0,
    horaMinima = 6,
    horaMaxima = 23,
  } = opciones;

  const bloques = fusionar(ocupado);
  const ventanas: Ventana[] = [];

  for (const tramo of tramosDelRango(desde, hasta, horaMinima, horaMaxima)) {
    let cursor = tramo.inicio.getTime();

    const dentro = bloques.filter(
      (b) => b.fin.getTime() > tramo.inicio.getTime() && b.inicio.getTime() < tramo.fin.getTime(),
    );

    for (const bloque of dentro) {
      const arranca = Math.max(bloque.inicio.getTime(), tramo.inicio.getTime());
      if (arranca > cursor) añadir(ventanas, cursor, arranca, minutosDeDesplazamiento, minutosDeSesion);
      cursor = Math.max(cursor, Math.min(bloque.fin.getTime(), tramo.fin.getTime()));
    }

    if (cursor < tramo.fin.getTime()) {
      añadir(ventanas, cursor, tramo.fin.getTime(), minutosDeDesplazamiento, minutosDeSesion);
    }
  }

  return ventanas;
}

function añadir(
  ventanas: Ventana[],
  inicio: number,
  fin: number,
  desplazamiento: number,
  minimo: number,
) {
  const minutos = Math.round((fin - inicio) / MINUTO);
  const minutosUtiles = minutos - desplazamiento * 2;
  if (minutosUtiles < minimo) return;
  ventanas.push({ inicio: new Date(inicio), fin: new Date(fin), minutos, minutosUtiles });
}

/**
 * Reparte las sesiones que faltan entre las ventanas disponibles.
 *
 * Es lo que convierte una falla en una decisión: hoy todas las apps dejan el
 * hueco y el usuario se las arregla solo, que es donde empieza el abandono.
 *
 * Coge la ventana más holgada de cada día distinto antes de repetir día: dos
 * sesiones el martes y ninguna el resto de la semana no es un plan.
 */
export function repartirSesiones(ventanas: Ventana[], cuantas: number): Ventana[] {
  if (cuantas <= 0) return [];

  const porDia = new Map<string, Ventana[]>();
  for (const v of ventanas) {
    const clave = `${v.inicio.getFullYear()}-${v.inicio.getMonth()}-${v.inicio.getDate()}`;
    porDia.set(clave, [...(porDia.get(clave) ?? []), v]);
  }

  // La mejor de cada día, ordenadas por holgura.
  const mejores = [...porDia.values()]
    .map((delDia) => delDia.reduce((a, b) => (b.minutosUtiles > a.minutosUtiles ? b : a)))
    .sort((a, b) => b.minutosUtiles - a.minutosUtiles);

  const elegidas = mejores.slice(0, cuantas);

  // Si no hay días suficientes, se completa con las que sobran, empezando por
  // las más holgadas.
  if (elegidas.length < cuantas) {
    const restantes = ventanas
      .filter((v) => !elegidas.includes(v))
      .sort((a, b) => b.minutosUtiles - a.minutosUtiles);
    elegidas.push(...restantes.slice(0, cuantas - elegidas.length));
  }

  return elegidas.sort((a, b) => a.inicio.getTime() - b.inicio.getTime());
}
