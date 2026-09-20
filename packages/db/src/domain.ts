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

/**
 * Grupos musculares. De esta clasificación salen el volumen por grupo, qué está
 * descansado y la sustitución de ejercicios equivalentes.
 *
 * Ojo: en la base esto es una columna `text` sin `CHECK`. El enum existe solo en
 * TypeScript, así que añadir un valor NO necesita migración — pero tampoco hay
 * nada en el motor que rechace un valor inventado. La única red es el compilador.
 */
export const MUSCULOS = [
  'pecho',
  'espalda',
  'hombros',
  'biceps',
  'triceps',
  'antebrazos',
  'trapecio',
  'abdomen',
  'oblicuos',
  'lumbares',
  'gluteos',
  'aductores',
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

// ---------------------------------------------------------------------------
// Lo que pregunta el onboarding
//
// Estas listas salen de las dieciséis pantallas del mockup, no del documento de
// producto, que no las cubre. Cambiar un valor de aquí rompe datos ya guardados:
// se añade al final, no se renombra.
// ---------------------------------------------------------------------------

/** Paso 2: se puede elegir más de uno. */
export const OBJETIVOS = [
  'perder_grasa',
  'ganar_musculo',
  'marcar_abdomen',
  'ser_mas_fuerte',
  'mejorar_condicion',
  'preparar_deporte',
  'mantenerme_saludable',
] as const;
export type Objetivo = (typeof OBJETIVOS)[number];

/** Paso 3. Modula el ritmo que propone el motor de reglas, no lo que se le exige al usuario. */
export const COMPROMISOS = ['intentarlo', 'verlo_progresar', 'comprometerme'] as const;
export type Compromiso = (typeof COMPROMISOS)[number];

/**
 * Paso 15, la última pregunta. Define cuánto interviene el sistema, así que vive
 * en el primer nivel de los ajustes y no enterrada al fondo.
 */
export const EXIGENCIAS = [
  'solo_entrenamientos',
  'alimentacion_cuando_pueda',
  'optimizar_todo',
] as const;
export type Exigencia = (typeof EXIGENCIAS)[number];

/**
 * Paso 4. Solo existe porque las fórmulas antropométricas de grasa corporal
 * usan coeficientes distintos, no para decorar el perfil.
 */
export const SEXOS = ['hombre', 'mujer'] as const;
export type Sexo = (typeof SEXOS)[number];

/** Paso 9. Cambia qué tan realista es sugerir un cambio de alimentación. */
export const QUIEN_COCINA = ['yo', 'familia', 'restaurante', 'mixto'] as const;
export type QuienCocina = (typeof QUIEN_COCINA)[number];

/** Paso 11. */
export const TIPOS_DE_CARDIO = [
  'caminadora',
  'correr',
  'bicicleta',
  'natacion',
  'futbol',
  'otro',
] as const;
export type TipoDeCardio = (typeof TIPOS_DE_CARDIO)[number];

export const INTENSIDADES = ['suave', 'moderada', 'fuerte'] as const;
export type Intensidad = (typeof INTENSIDADES)[number];

/** Paso 13. Lista abierta: «otro» se guarda como texto libre junto a estos. */
export const SUPLEMENTOS = [
  'creatina',
  'proteina',
  'colageno',
  'multivitaminico',
  'omega_3',
] as const;
export type Suplemento = (typeof SUPLEMENTOS)[number];

/** Paso 14. De aquí sale qué integración de salud tiene sentido ofrecer. */
export const RELOJES = ['ninguno', 'apple', 'garmin', 'samsung', 'otro'] as const;
export type Reloj = (typeof RELOJES)[number];

/**
 * Paso 8, el mapa corporal de molestias. No son los grupos musculares de
 * MUSCULOS: aquí importan también las articulaciones, que es donde duele y lo
 * que hay que poder excluir de una rutina.
 */
export const ZONAS_DEL_CUERPO = [
  'cuello',
  'hombro',
  'codo',
  'muneca',
  'mano',
  'pecho',
  'espalda_alta',
  'espalda_baja',
  'cadera',
  'ingle',
  'rodilla',
  'tobillo',
  'pie',
  'cuadriceps',
  'isquiotibiales',
  'gemelo',
  'abdomen',
] as const;
export type ZonaDelCuerpo = (typeof ZONAS_DEL_CUERPO)[number];
