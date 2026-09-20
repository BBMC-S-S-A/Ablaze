/**
 * Los valores del anexo de marca. Ninguna pantalla define un color, un tamaño de
 * texto ni un espaciado a mano: todo sale de aquí.
 */

export const colores = {
  /** Acento principal. Lo activo y lo logrado. */
  fuego: '#FF4B1F',
  /** Transición del degradado y estados intermedios. */
  naranja: '#FF8A00',
  /**
   * Núcleo. **Reservado para récords.** Si aparece con frecuencia deja de
   * significar un récord, así que no se usa para destacar cualquier cosa.
   */
  amarillo: '#FFD93D',
  /** Texto secundario y estructura. */
  gris: '#A7A7A7',
  /** Fondo base de toda la interfaz. */
  oscuro: '#0B0B0F',

  // Derivados, para no inventarlos en cada pantalla.
  superficie: '#15151B',
  superficieAlta: '#1E1E26',
  borde: '#2A2A34',
  bordeActivo: '#FF4B1F',
  texto: '#F2F2F4',
  textoTenue: '#6E6E78',
  /** Sobre fondo fuego. */
  sobreFuego: '#0B0B0F',
} as const;

export type Color = keyof typeof colores;

/** Escala de 4. Se usan los pasos, no números sueltos. */
export const espacio = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const radio = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  redondo: 999,
} as const;

/**
 * Las tres familias del anexo, más la monoespaciada que recomienda para las
 * cifras: así las columnas del historial quedan alineadas y se pueden comparar
 * de un vistazo.
 */
export const fuentes = {
  titulo: 'Archivo_900Black',
  encabezado: 'Archivo_700Bold',
  cuerpo: 'Inter_400Regular',
  interfaz: 'Inter_500Medium',
  interfazFuerte: 'Inter_600SemiBold',
  cifra: 'JetBrainsMono_500Medium',
  cifraFuerte: 'JetBrainsMono_700Bold',
} as const;

/**
 * Los estilos de texto que existen. Si hace falta uno nuevo se añade aquí, no se
 * escribe un `fontSize` suelto en una pantalla.
 */
export const textos = {
  /** Solo el logotipo. Interletraje muy negativo, como pide el anexo. */
  marca: { fontFamily: fuentes.titulo, fontSize: 40, letterSpacing: -1.6, lineHeight: 44 },
  titulo: { fontFamily: fuentes.titulo, fontSize: 26, letterSpacing: -0.8, lineHeight: 32 },
  /** Secciones y etiquetas, con espaciado abierto. */
  encabezado: { fontFamily: fuentes.encabezado, fontSize: 17, letterSpacing: 0.2, lineHeight: 24 },
  etiqueta: { fontFamily: fuentes.encabezado, fontSize: 12, letterSpacing: 0.8, lineHeight: 16 },
  cuerpo: { fontFamily: fuentes.cuerpo, fontSize: 15, lineHeight: 22 },
  cuerpoMenor: { fontFamily: fuentes.cuerpo, fontSize: 13, lineHeight: 18 },
  interfaz: { fontFamily: fuentes.interfaz, fontSize: 15, lineHeight: 20 },
  boton: { fontFamily: fuentes.interfazFuerte, fontSize: 16, lineHeight: 20 },
  /** Series, pesos, repeticiones y horas. */
  cifra: { fontFamily: fuentes.cifra, fontSize: 16, lineHeight: 20 },
  cifraGrande: { fontFamily: fuentes.cifraFuerte, fontSize: 34, lineHeight: 40 },
} as const;

export type EstiloDeTexto = keyof typeof textos;

/**
 * Altura mínima de cualquier cosa que se toque. Esto se registra con las manos
 * sudadas entre descansos: un objetivo pequeño se falla.
 */
export const TOQUE_MINIMO = 48;
