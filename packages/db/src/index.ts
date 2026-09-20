/**
 * @ablaze/db — el esquema compartido entre la app y la API.
 *
 * Desde aquí salen solo el dominio y los tipos, que son los que valen en los dos
 * lados. Cada dialecto se importa por su puerta:
 *
 *   import { exercises } from '@ablaze/db/pg';      // servidor
 *   import { exercises } from '@ablaze/db/sqlite';  // dispositivo
 *
 * Importar un dialecto desde el otro lado arrastra un driver que no existe ahí,
 * así que la separación no es cosmética.
 */
export * from './domain.ts';
