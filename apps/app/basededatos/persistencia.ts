/**
 * Pedirle al navegador que no borre lo que guardamos.
 *
 * Safari desaloja el almacenamiento de los sitios que no se usan. Instalar la
 * PWA en la pantalla de inicio lo mitiga mucho y esto lo mitiga más, pero
 * ninguna de las dos cosas lo garantiza. Por eso además existen la
 * sincronización con el servidor y la exportación a archivo: esto es la primera
 * línea, no la única.
 */

export type EstadoDelAlmacenamiento = {
  /** El navegador se comprometió a no desalojar los datos. */
  persistido: boolean;
  /** Bytes usados y disponibles, cuando el navegador los reporta. */
  usados?: number;
  disponibles?: number;
  soportado: boolean;
};

export async function asegurarPersistencia(): Promise<EstadoDelAlmacenamiento> {
  if (typeof navigator === 'undefined' || !navigator.storage) {
    return { persistido: false, soportado: false };
  }

  let persistido = false;
  try {
    persistido = (await navigator.storage.persisted?.()) ?? false;
    // Safari lo concede sin preguntar cuando la PWA está instalada en la
    // pantalla de inicio, y lo niega en una pestaña normal. Negarlo no es un
    // error: es información.
    if (!persistido) persistido = (await navigator.storage.persist?.()) ?? false;
  } catch {
    persistido = false;
  }

  let usados: number | undefined;
  let disponibles: number | undefined;
  try {
    const estimacion = await navigator.storage.estimate?.();
    usados = estimacion?.usage;
    disponibles = estimacion?.quota;
  } catch {
    // La estimación es un lujo; que falle no cambia nada.
  }

  return { persistido, usados, disponibles, soportado: true };
}
