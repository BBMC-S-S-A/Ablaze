/**
 * El contrato que cumplen los dos motores: el de WebAssembly para la PWA y, el
 * día que haya build nativa, el de expo-sqlite.
 *
 * Metro elige el archivo por plataforma (`motor.web.ts` contra `motor.ts`), así
 * que arriba de esta capa nada sabe en cuál está corriendo.
 */

export type Motor = {
  /** Devuelve las filas como arreglos de valores, que es lo que espera Drizzle. */
  ejecutar(sql: string, parametros: readonly unknown[]): Promise<unknown[][]>;
  cerrar(): Promise<void>;
  /** Cómo se está guardando: sirve para poder decírselo al usuario. */
  almacenamiento: 'opfs' | 'memoria' | 'nativo';
  /**
   * Si es `false`, los datos desaparecen al cerrar la pestaña. Pasa en
   * navegación privada o en navegadores sin OPFS. La interfaz TIENE que avisarlo:
   * registrar una semana de entrenamientos y perderla sin haber sido advertido es
   * la peor cosa que puede hacer esta aplicación.
   */
  persistente: boolean;
  /** Para el diagnóstico: qué falló al intentar la vía persistente. */
  motivo?: string;
};
