/**
 * Constantes del dominio, compartidas por los dos dialectos.
 *
 * Drizzle no genera Postgres y SQLite desde una sola definición de tabla, así
 * que el esquema se escribe dos veces (schema.pg.ts y schema.sqlite.ts). Lo que
 * sí se comparte es esto: los valores permitidos y los tipos. Si una lista de
 * aquí cambia, los dos esquemas cambian con ella y el compilador avisa.
 */

/** Los tres círculos de visibilidad. Toda fila nace con uno. */
export const VISIBILIDADES = ['privado', 'parceros', 'publico'] as const;
export type Visibilidad = (typeof VISIBILIDADES)[number];

/**
 * Todo lo que ocupa tiempo es un bloque. Una clase, un turno y una sesión de
 * pierna son el mismo tipo de registro, y por eso el calendario es una consulta
 * y no un segundo producto.
 */
export const TIPOS_DE_BLOQUE = ['clase', 'trabajo', 'sesion', 'libre', 'otro'] as const;
export type TipoDeBloque = (typeof TIPOS_DE_BLOQUE)[number];

/** Grupos musculares. De esta clasificación salen el volumen, el descanso y la sustitución de ejercicios. */
export const MUSCULOS = [
  'pecho',
  'espalda',
  'hombros',
  'biceps',
  'triceps',
  'antebrazos',
  'trapecio',
  'abdomen',
  'lumbares',
  'gluteos',
  'cuadriceps',
  'isquiotibiales',
  'gemelos',
  'cuello',
] as const;
export type Musculo = (typeof MUSCULOS)[number];

/** Qué hace falta para ejecutar un ejercicio. Cruza con el inventario de la sede. */
export const EQUIPAMIENTOS = [
  'barra',
  'mancuerna',
  'maquina',
  'polea',
  'peso_corporal',
  'kettlebell',
  'banda',
  'otro',
] as const;
export type Equipamiento = (typeof EQUIPAMIENTOS)[number];
