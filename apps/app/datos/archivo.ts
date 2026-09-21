/**
 * Descargar y abrir archivos en nativo. Todavía no existe.
 *
 * Metro solo llega aquí cuando la plataforma no es web, y hoy la app solo se
 * publica como PWA. Con build nativa esto pasa a ser expo-file-system más
 * expo-sharing y expo-document-picker.
 *
 * Las firmas tienen que ser idénticas a las de `archivo.web.ts`: TypeScript
 * comprueba contra ESTE archivo, así que una firma que no coincida rompe la
 * compilación o, peor, la deja pasar y falla en web.
 */

export function descargar(_nombre: string, _contenido: string, _tipo?: string): void {
  throw new Error('Exportar a archivo todavía solo funciona en la versión web.');
}

export function elegirArchivo(): Promise<string | null> {
  throw new Error('Abrir un archivo todavía solo funciona en la versión web.');
}
