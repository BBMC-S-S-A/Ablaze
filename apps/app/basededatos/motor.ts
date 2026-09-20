import type { Motor } from './motor.tipos.ts';

/**
 * Motor para iOS y Android nativos. Todavía no existe.
 *
 * Metro solo llega aquí cuando la plataforma NO es web, y hoy la app únicamente
 * se publica como PWA porque no se paga la cuenta de Apple Developer. El día que
 * haya build nativa, esto pasa a ser expo-sqlite con `drizzle-orm/expo-sqlite`, y
 * nada por encima de esta capa cambia: el contrato es el mismo.
 *
 * Falla en voz alta a propósito. Un motor en memoria disfrazado de real haría
 * que la app pareciera funcionar mientras pierde cada entrenamiento.
 */
export async function abrirMotor(): Promise<Motor> {
  throw new Error(
    'No hay motor de base de datos para esta plataforma. Hoy Ablaze solo corre como PWA; ' +
      'la build nativa usará expo-sqlite y todavía no está montada.',
  );
}
