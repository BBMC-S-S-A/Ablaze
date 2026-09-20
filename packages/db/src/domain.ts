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

/** Un bloque se repite o no. Nada de reglas de calendario completas hasta que hagan falta. */
export const REPETICIONES = ['ninguna', 'semanal'] as const;
export type Repeticion = (typeof REPETICIONES)[number];

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

/** Con qué lado se hizo la serie. Solo importa en ejercicios unilaterales, y es lo que permite ver asimetrías. */
export const LADOS = ['ambos', 'izquierdo', 'derecho'] as const;
export type Lado = (typeof LADOS)[number];

/**
 * Los cinco niveles de la llama. El índice del arreglo es el nivel, y el nivel
 * alcanzado es el piso: se atenúa, nunca se reinicia.
 */
export const NIVELES_DE_LLAMA = ['chispa', 'brasa', 'llama', 'hoguera', 'incendio'] as const;
export type NivelDeLlama = (typeof NIVELES_DE_LLAMA)[number];

/**
 * La foto del momento es textura emocional y alimenta el recap. La de progreso
 * es medición y va con guía de encuadre. No se mezclan.
 */
export const TIPOS_DE_FOTO = ['momento', 'progreso'] as const;
export type TipoDeFoto = (typeof TIPOS_DE_FOTO)[number];

export const ANGULOS_DE_FOTO = ['frente', 'perfil', 'espalda'] as const;
export type AnguloDeFoto = (typeof ANGULOS_DE_FOTO)[number];

/**
 * De dónde salió el porcentaje de grasa. Existe por el principio de que lo
 * medido mueve el modelo y lo estimado solo pinta una capa encima: sin saber el
 * origen, la interfaz no puede rotular una estimación como tal.
 */
export const ORIGENES_DE_GRASA = ['manual', 'formula', 'foto'] as const;
export type OrigenDeGrasa = (typeof ORIGENES_DE_GRASA)[number];

/** De dónde vino el alimento. Se integra con bases abiertas en vez de construir una propia. */
export const FUENTES_DE_ALIMENTO = ['openfoodfacts', 'usda', 'manual'] as const;
export type FuenteDeAlimento = (typeof FUENTES_DE_ALIMENTO)[number];

export const COMIDAS = ['desayuno', 'almuerzo', 'cena', 'snack'] as const;
export type Comida = (typeof COMIDAS)[number];

/** Una amistad solo existe cuando las dos partes la aceptaron. */
export const ESTADOS_DE_AMISTAD = ['pendiente', 'aceptada', 'bloqueada'] as const;
export type EstadoDeAmistad = (typeof ESTADOS_DE_AMISTAD)[number];

/**
 * Equivalencia de placa a kilogramos de una máquina: número de placa a kilos
 * reales. Sin esto, una máquina que marca placas numeradas no se puede
 * registrar en kilos y su historial no se puede comparar con el de una barra.
 */
export type TablaDePlacas = Record<string, number>;
