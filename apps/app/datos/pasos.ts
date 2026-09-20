/**
 * Los pasos del onboarding y dónde vive cada uno.
 *
 * El mockup define dieciséis. Aquí solo están los que existen de verdad: la
 * reanudación mira esta lista, así que declarar un paso que no tiene pantalla
 * mandaría al usuario a una ruta vacía.
 */

export type Paso = {
  /** Su número en el mockup. No se renumera: es lo que se guarda en la base. */
  numero: number;
  ruta: string;
  titulo: string;
};

export const PASOS: Paso[] = [
  { numero: 1, ruta: '/onboarding', titulo: 'Bienvenida' },
  { numero: 2, ruta: '/onboarding/objetivos', titulo: '¿Qué quieres conseguir?' },
  { numero: 3, ruta: '/onboarding/compromiso', titulo: '¿Qué tan importante es este objetivo?' },
];

/** Los dieciséis del mockup, aunque todavía no estén todos construidos. */
export const TOTAL_DE_PASOS = 16;

/**
 * A qué pantalla volver según hasta dónde se llegó.
 *
 * Si el guardado dice un paso que todavía no tiene pantalla —porque se
 * construirán después— se vuelve al último construido en vez de a una ruta que
 * no existe.
 */
export function rutaParaReanudar(ultimoPasoGuardado: number): string {
  const siguiente = PASOS.find((p) => p.numero === ultimoPasoGuardado + 1);
  if (siguiente) return siguiente.ruta;

  const ultimoConstruido = PASOS[PASOS.length - 1];
  if (!ultimoConstruido) throw new Error('No hay ningún paso de onboarding definido.');

  // Ya pasó de lo que hay construido: se queda en lo último que existe.
  if (ultimoPasoGuardado >= ultimoConstruido.numero) return ultimoConstruido.ruta;

  return PASOS[0]?.ruta ?? '/onboarding';
}
