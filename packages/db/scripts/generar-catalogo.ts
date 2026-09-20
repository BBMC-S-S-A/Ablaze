/**
 * Genera `src/catalogo-ejercicios.ts` a partir de la tabla de abajo.
 *
 * Los identificadores son UUID versión 5 derivados de la clave, no aleatorios.
 * Eso importa de verdad: si cada dispositivo generase su propio uuid para «Press
 * de banca con barra», al sincronizar una serie de un teléfono referenciaría un
 * ejercicio que en el otro no existe. Derivarlos de la clave hace que el mismo
 * ejercicio sea la misma fila en todas partes, sin coordinar nada.
 *
 * Volver a correr esto con las mismas claves produce exactamente el mismo
 * archivo. Añadir ejercicios es añadir filas aquí y correr `npm run catalogo`.
 *
 * **No cambiar una clave nunca.** Cambiarla es crear un ejercicio distinto y
 * dejar huérfanas las series que apuntaban al anterior.
 */
import { createHash } from 'node:crypto';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { EQUIPAMIENTOS, MUSCULOS, type Equipamiento, type Musculo } from '../src/domain.ts';

/** El espacio de nombres del que cuelgan todos los ejercicios del catálogo. */
const NAMESPACE_URL = '6ba7b811-9dad-11d1-80b4-00c04fd430c8';

function uuid5(nombre: string): string {
  const ns = Buffer.from(NAMESPACE_URL.replace(/-/g, ''), 'hex');
  const hash = createHash('sha1').update(Buffer.concat([ns, Buffer.from(nombre, 'utf8')])).digest();
  const bytes = Buffer.from(hash.subarray(0, 16));
  bytes[6] = (bytes[6]! & 0x0f) | 0x50; // versión 5
  bytes[8] = (bytes[8]! & 0x3f) | 0x80; // variante RFC 4122
  const h = bytes.toString('hex');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

/** clave · nombre · músculo principal · secundarios · equipamiento · unilateral */
type Fila = [string, string, Musculo, Musculo[], Equipamiento, boolean];

const FILAS: Fila[] = [
  // ---- Pecho ----
  ['press-banca-barra', 'Press de banca con barra', 'pecho', ['triceps', 'hombros'], 'barra', false],
  ['press-inclinado-barra', 'Press inclinado con barra', 'pecho', ['hombros', 'triceps'], 'barra', false],
  ['press-declinado-barra', 'Press declinado con barra', 'pecho', ['triceps'], 'barra', false],
  ['press-banca-mancuernas', 'Press de banca con mancuernas', 'pecho', ['triceps', 'hombros'], 'mancuerna', false],
  ['press-inclinado-mancuernas', 'Press inclinado con mancuernas', 'pecho', ['hombros', 'triceps'], 'mancuerna', false],
  ['press-declinado-mancuernas', 'Press declinado con mancuernas', 'pecho', ['triceps'], 'mancuerna', false],
  ['press-pecho-maquina', 'Press de pecho en máquina', 'pecho', ['triceps', 'hombros'], 'maquina', false],
  ['press-pecho-polea-unilateral', 'Press de pecho unilateral en polea', 'pecho', ['triceps', 'hombros'], 'polea', true],
  ['aperturas-mancuernas', 'Aperturas con mancuernas', 'pecho', ['hombros'], 'mancuerna', false],
  ['aperturas-inclinadas-mancuernas', 'Aperturas inclinadas con mancuernas', 'pecho', ['hombros'], 'mancuerna', false],
  ['contractor-pecho', 'Contractor de pecho', 'pecho', ['hombros'], 'maquina', false],
  ['cruce-poleas-alto', 'Cruce de poleas desde arriba', 'pecho', ['hombros'], 'polea', false],
  ['cruce-poleas-bajo', 'Cruce de poleas desde abajo', 'pecho', ['hombros'], 'polea', false],
  ['flexiones', 'Flexiones de pecho', 'pecho', ['triceps', 'hombros', 'abdomen'], 'peso_corporal', false],
  ['flexiones-inclinadas', 'Flexiones con los pies elevados', 'pecho', ['hombros', 'triceps'], 'peso_corporal', false],
  ['fondos-pecho', 'Fondos en paralelas inclinado al pecho', 'pecho', ['triceps', 'hombros'], 'peso_corporal', false],
  ['pullover-mancuerna', 'Pullover con mancuerna', 'pecho', ['espalda', 'triceps'], 'mancuerna', false],

  // ---- Espalda ----
  ['dominadas-pronas', 'Dominadas agarre prono', 'espalda', ['biceps', 'antebrazos'], 'peso_corporal', false],
  ['dominadas-supinas', 'Dominadas agarre supino', 'espalda', ['biceps'], 'peso_corporal', false],
  ['dominadas-neutras', 'Dominadas agarre neutro', 'espalda', ['biceps', 'antebrazos'], 'peso_corporal', false],
  ['jalon-al-pecho', 'Jalón al pecho', 'espalda', ['biceps'], 'polea', false],
  ['jalon-agarre-cerrado', 'Jalón con agarre cerrado', 'espalda', ['biceps'], 'polea', false],
  ['jalon-unilateral', 'Jalón unilateral en polea', 'espalda', ['biceps'], 'polea', true],
  ['remo-barra', 'Remo con barra', 'espalda', ['biceps', 'lumbares', 'trapecio'], 'barra', false],
  ['remo-pendlay', 'Remo Pendlay', 'espalda', ['biceps', 'lumbares'], 'barra', false],
  ['remo-mancuerna-una-mano', 'Remo con mancuerna a una mano', 'espalda', ['biceps', 'trapecio'], 'mancuerna', true],
  ['remo-gorila', 'Remo gorila con mancuernas', 'espalda', ['biceps', 'trapecio'], 'mancuerna', false],
  ['remo-sentado-polea', 'Remo sentado en polea', 'espalda', ['biceps', 'trapecio'], 'polea', false],
  ['remo-maquina', 'Remo en máquina', 'espalda', ['biceps'], 'maquina', false],
  ['remo-t', 'Remo en T', 'espalda', ['biceps', 'trapecio'], 'barra', false],
  ['remo-invertido', 'Remo invertido', 'espalda', ['biceps', 'abdomen'], 'peso_corporal', false],
  ['pullover-polea', 'Pullover en polea', 'espalda', ['triceps'], 'polea', false],
  ['peso-muerto', 'Peso muerto convencional', 'espalda', ['gluteos', 'isquiotibiales', 'lumbares', 'trapecio'], 'barra', false],
  ['peso-muerto-sumo', 'Peso muerto sumo', 'gluteos', ['cuadriceps', 'espalda', 'aductores', 'lumbares'], 'barra', false],
  ['rack-pull', 'Rack pull', 'espalda', ['trapecio', 'lumbares', 'gluteos'], 'barra', false],
  ['hiperextensiones', 'Hiperextensiones lumbares', 'lumbares', ['gluteos', 'isquiotibiales'], 'peso_corporal', false],
  ['buenos-dias', 'Buenos días', 'isquiotibiales', ['lumbares', 'gluteos'], 'barra', false],

  // ---- Hombros ----
  ['press-militar-barra', 'Press militar con barra', 'hombros', ['triceps', 'trapecio'], 'barra', false],
  ['press-militar-mancuernas', 'Press militar con mancuernas', 'hombros', ['triceps'], 'mancuerna', false],
  ['press-arnold', 'Press Arnold', 'hombros', ['triceps'], 'mancuerna', false],
  ['press-hombro-maquina', 'Press de hombro en máquina', 'hombros', ['triceps'], 'maquina', false],
  ['press-tras-nuca', 'Press tras nuca', 'hombros', ['triceps'], 'barra', false],
  ['elevaciones-laterales', 'Elevaciones laterales', 'hombros', ['trapecio'], 'mancuerna', false],
  ['elevaciones-laterales-polea', 'Elevaciones laterales en polea', 'hombros', ['trapecio'], 'polea', true],
  ['elevaciones-laterales-banda', 'Elevaciones laterales con banda', 'hombros', ['trapecio'], 'banda', false],
  ['elevaciones-laterales-maquina', 'Elevaciones laterales en máquina', 'hombros', ['trapecio'], 'maquina', false],
  ['elevaciones-frontales', 'Elevaciones frontales', 'hombros', ['pecho'], 'mancuerna', false],
  ['pajaros-mancuernas', 'Pájaros con mancuernas', 'hombros', ['espalda', 'trapecio'], 'mancuerna', false],
  ['pajaros-maquina', 'Pájaros en máquina', 'hombros', ['espalda'], 'maquina', false],
  ['face-pull', 'Face pull', 'hombros', ['trapecio', 'espalda'], 'polea', false],
  ['remo-al-menton', 'Remo al mentón', 'hombros', ['trapecio', 'biceps'], 'barra', false],

  // ---- Trapecio ----
  ['encogimientos-barra', 'Encogimientos con barra', 'trapecio', ['antebrazos'], 'barra', false],
  ['encogimientos-mancuernas', 'Encogimientos con mancuernas', 'trapecio', ['antebrazos'], 'mancuerna', false],
  ['encogimientos-maquina', 'Encogimientos en máquina', 'trapecio', ['antebrazos'], 'maquina', false],

  // ---- Bíceps ----
  ['curl-barra', 'Curl con barra', 'biceps', ['antebrazos'], 'barra', false],
  ['curl-barra-z', 'Curl con barra Z', 'biceps', ['antebrazos'], 'barra', false],
  ['curl-mancuernas-alterno', 'Curl alterno con mancuernas', 'biceps', ['antebrazos'], 'mancuerna', true],
  ['curl-martillo', 'Curl martillo', 'biceps', ['antebrazos'], 'mancuerna', true],
  ['curl-concentrado', 'Curl concentrado', 'biceps', ['antebrazos'], 'mancuerna', true],
  ['curl-predicador', 'Curl en banco predicador', 'biceps', ['antebrazos'], 'barra', false],
  ['curl-inclinado', 'Curl inclinado en banco', 'biceps', ['antebrazos'], 'mancuerna', false],
  ['curl-arana', 'Curl araña', 'biceps', ['antebrazos'], 'mancuerna', false],
  ['curl-polea-baja', 'Curl en polea baja', 'biceps', ['antebrazos'], 'polea', false],
  ['curl-maquina', 'Curl en máquina', 'biceps', ['antebrazos'], 'maquina', false],
  ['curl-banda', 'Curl con banda', 'biceps', ['antebrazos'], 'banda', false],

  // ---- Tríceps ----
  ['press-frances', 'Press francés', 'triceps', ['hombros'], 'barra', false],
  ['press-cerrado', 'Press de banca agarre cerrado', 'triceps', ['pecho', 'hombros'], 'barra', false],
  ['extension-triceps-polea', 'Extensión de tríceps en polea', 'triceps', [], 'polea', false],
  ['extension-triceps-cuerda', 'Extensión de tríceps con cuerda', 'triceps', [], 'polea', false],
  ['extension-triceps-sobre-cabeza', 'Extensión de tríceps sobre la cabeza', 'triceps', ['hombros'], 'mancuerna', false],
  ['extension-triceps-maquina', 'Extensión de tríceps en máquina', 'triceps', [], 'maquina', false],
  ['extension-triceps-banda', 'Extensión de tríceps con banda', 'triceps', [], 'banda', false],
  ['patada-triceps', 'Patada de tríceps', 'triceps', ['hombros'], 'mancuerna', true],
  ['fondos-triceps', 'Fondos en paralelas vertical', 'triceps', ['pecho', 'hombros'], 'peso_corporal', false],
  ['fondos-banco', 'Fondos en banco', 'triceps', ['pecho', 'hombros'], 'peso_corporal', false],
  ['flexiones-diamante', 'Flexiones diamante', 'triceps', ['pecho', 'hombros'], 'peso_corporal', false],

  // ---- Antebrazos ----
  ['curl-muneca', 'Curl de muñeca', 'antebrazos', [], 'barra', false],
  ['curl-muneca-inverso', 'Curl de muñeca inverso', 'antebrazos', [], 'barra', false],
  ['curl-inverso', 'Curl inverso', 'antebrazos', ['biceps'], 'barra', false],
  ['paseo-granjero', 'Paseo del granjero', 'antebrazos', ['trapecio', 'abdomen'], 'mancuerna', false],

  // ---- Cuádriceps ----
  ['sentadilla-trasera', 'Sentadilla trasera con barra', 'cuadriceps', ['gluteos', 'lumbares', 'isquiotibiales'], 'barra', false],
  ['sentadilla-frontal', 'Sentadilla frontal', 'cuadriceps', ['gluteos', 'abdomen'], 'barra', false],
  ['sentadilla-goblet', 'Sentadilla goblet', 'cuadriceps', ['gluteos', 'abdomen'], 'mancuerna', false],
  ['sentadilla-goblet-kettlebell', 'Sentadilla goblet con kettlebell', 'cuadriceps', ['gluteos', 'abdomen'], 'kettlebell', false],
  ['sentadilla-multipower', 'Sentadilla en multipower', 'cuadriceps', ['gluteos'], 'maquina', false],
  ['sentadilla-libre', 'Sentadilla sin peso', 'cuadriceps', ['gluteos'], 'peso_corporal', false],
  ['sentadilla-sissy', 'Sentadilla sissy', 'cuadriceps', [], 'peso_corporal', false],
  ['sentadilla-pistol', 'Sentadilla a una pierna', 'cuadriceps', ['gluteos', 'abdomen'], 'peso_corporal', true],
  ['prensa-piernas', 'Prensa de piernas', 'cuadriceps', ['gluteos', 'isquiotibiales'], 'maquina', false],
  ['hack-squat', 'Hack squat', 'cuadriceps', ['gluteos'], 'maquina', false],
  ['extension-cuadriceps', 'Extensión de cuádriceps', 'cuadriceps', [], 'maquina', false],
  ['zancadas-mancuernas', 'Zancadas con mancuernas', 'cuadriceps', ['gluteos', 'isquiotibiales'], 'mancuerna', true],
  ['zancadas-caminando', 'Zancadas caminando', 'cuadriceps', ['gluteos', 'isquiotibiales'], 'mancuerna', true],
  ['sentadilla-bulgara', 'Sentadilla búlgara', 'cuadriceps', ['gluteos', 'isquiotibiales'], 'mancuerna', true],
  ['subida-al-cajon', 'Subida al cajón', 'cuadriceps', ['gluteos'], 'mancuerna', true],

  // ---- Isquiotibiales ----
  ['peso-muerto-rumano', 'Peso muerto rumano', 'isquiotibiales', ['gluteos', 'lumbares'], 'barra', false],
  ['peso-muerto-rumano-mancuernas', 'Peso muerto rumano con mancuernas', 'isquiotibiales', ['gluteos', 'lumbares'], 'mancuerna', false],
  ['peso-muerto-piernas-rigidas', 'Peso muerto con piernas rígidas', 'isquiotibiales', ['gluteos', 'lumbares'], 'barra', false],
  ['peso-muerto-una-pierna', 'Peso muerto a una pierna', 'isquiotibiales', ['gluteos', 'lumbares'], 'mancuerna', true],
  ['curl-femoral-tumbado', 'Curl femoral tumbado', 'isquiotibiales', ['gemelos'], 'maquina', false],
  ['curl-femoral-sentado', 'Curl femoral sentado', 'isquiotibiales', ['gemelos'], 'maquina', false],
  ['curl-femoral-de-pie', 'Curl femoral de pie', 'isquiotibiales', [], 'maquina', true],
  ['curl-nordico', 'Curl nórdico', 'isquiotibiales', ['gemelos'], 'peso_corporal', false],

  // ---- Glúteos y aductores ----
  ['hip-thrust', 'Hip thrust con barra', 'gluteos', ['isquiotibiales', 'cuadriceps'], 'barra', false],
  ['puente-gluteo', 'Puente de glúteo', 'gluteos', ['isquiotibiales'], 'peso_corporal', false],
  ['patada-gluteo-polea', 'Patada de glúteo en polea', 'gluteos', ['isquiotibiales'], 'polea', true],
  ['abduccion-cadera-maquina', 'Abducción de cadera en máquina', 'gluteos', [], 'maquina', false],
  ['abduccion-cadera-banda', 'Abducción de cadera con banda', 'gluteos', [], 'banda', false],
  ['aduccion-cadera-maquina', 'Aducción de cadera en máquina', 'aductores', [], 'maquina', false],
  ['aduccion-cadera-polea', 'Aducción de cadera en polea', 'aductores', ['gluteos'], 'polea', true],
  ['swing-kettlebell', 'Swing con kettlebell', 'gluteos', ['isquiotibiales', 'lumbares', 'hombros'], 'kettlebell', false],

  // ---- Gemelos ----
  ['elevacion-talones-de-pie', 'Elevación de talones de pie', 'gemelos', [], 'maquina', false],
  ['elevacion-talones-sentado', 'Elevación de talones sentado', 'gemelos', [], 'maquina', false],
  ['elevacion-talones-prensa', 'Elevación de talones en prensa', 'gemelos', [], 'maquina', false],
  ['elevacion-talones-una-pierna', 'Elevación de talones a una pierna', 'gemelos', [], 'peso_corporal', true],

  // ---- Abdomen y oblicuos ----
  ['crunch', 'Crunch abdominal', 'abdomen', [], 'peso_corporal', false],
  ['crunch-polea', 'Crunch en polea', 'abdomen', [], 'polea', false],
  ['crunch-maquina', 'Crunch en máquina', 'abdomen', [], 'maquina', false],
  ['encogimiento-inverso', 'Encogimiento inverso', 'abdomen', [], 'peso_corporal', false],
  ['elevacion-piernas-colgado', 'Elevación de piernas colgado', 'abdomen', ['antebrazos'], 'peso_corporal', false],
  ['elevacion-rodillas-colgado', 'Elevación de rodillas colgado', 'abdomen', ['antebrazos'], 'peso_corporal', false],
  ['plancha', 'Plancha', 'abdomen', ['hombros', 'lumbares'], 'peso_corporal', false],
  ['plancha-lateral', 'Plancha lateral', 'oblicuos', ['abdomen', 'hombros'], 'peso_corporal', true],
  ['rueda-abdominal', 'Rueda abdominal', 'abdomen', ['hombros', 'lumbares'], 'otro', false],
  ['hollow-hold', 'Hollow hold', 'abdomen', [], 'peso_corporal', false],
  ['dead-bug', 'Dead bug', 'abdomen', ['lumbares'], 'peso_corporal', false],
  ['escaladores', 'Escaladores', 'abdomen', ['hombros', 'cuadriceps'], 'peso_corporal', false],
  ['giro-ruso', 'Giro ruso', 'oblicuos', ['abdomen'], 'mancuerna', false],
  ['press-pallof', 'Press Pallof', 'oblicuos', ['abdomen'], 'polea', true],
  ['lenador-polea', 'Leñador en polea', 'oblicuos', ['abdomen', 'hombros'], 'polea', true],

  // ---- Cuello ----
  ['flexion-cuello', 'Flexión de cuello', 'cuello', [], 'otro', false],
  ['extension-cuello', 'Extensión de cuello', 'cuello', [], 'otro', false],

  // ---- Movimientos completos ----
  ['cargada-y-press', 'Cargada y press', 'hombros', ['cuadriceps', 'espalda', 'triceps'], 'barra', false],
  ['thruster', 'Thruster', 'hombros', ['cuadriceps', 'gluteos', 'triceps'], 'barra', false],
  ['turkish-get-up', 'Turkish get-up', 'hombros', ['abdomen', 'cuadriceps'], 'kettlebell', true],
  ['burpee', 'Burpee', 'cuadriceps', ['pecho', 'hombros', 'abdomen'], 'peso_corporal', false],
];

// --- Comprobaciones antes de escribir nada -------------------------------

const claves = new Set<string>();
const nombres = new Set<string>();
for (const [clave, nombre, principal, secundarios, equipamiento] of FILAS) {
  if (claves.has(clave)) throw new Error(`Clave repetida: ${clave}`);
  if (nombres.has(nombre)) throw new Error(`Nombre repetido: ${nombre}`);
  claves.add(clave);
  nombres.add(nombre);

  if (!MUSCULOS.includes(principal)) throw new Error(`Músculo desconocido en ${clave}: ${principal}`);
  if (!EQUIPAMIENTOS.includes(equipamiento)) throw new Error(`Equipamiento desconocido en ${clave}`);
  if (secundarios.includes(principal)) {
    throw new Error(`${clave}: ${principal} está como principal y como secundario`);
  }
  if (new Set(secundarios).size !== secundarios.length) {
    throw new Error(`${clave}: tiene un secundario repetido`);
  }
}

// --- Emitir ---------------------------------------------------------------

const entradas = FILAS.map(([clave, nombre, principal, secundarios, equipamiento, unilateral]) => ({
  id: uuid5(`https://ablaze.app/ejercicio/${clave}`),
  clave,
  nombre,
  musculoPrincipal: principal,
  musculosSecundarios: secundarios,
  equipamiento,
  unilateral,
}));

const contenido = `// Generado por scripts/generar-catalogo.ts — no editar a mano.
// Se regenera con \`npm run catalogo\`. Los ids son UUID v5 derivados de la clave,
// así que el mismo ejercicio es la misma fila en todos los dispositivos.

import type { Equipamiento, Musculo } from './domain.ts';

export type EjercicioDelCatalogo = {
  /** Estable entre dispositivos. Derivado de la clave, nunca aleatorio. */
  id: string;
  /** Legible, para referirse a un ejercicio desde el código. No se persiste. */
  clave: string;
  nombre: string;
  musculoPrincipal: Musculo;
  musculosSecundarios: Musculo[];
  equipamiento: Equipamiento;
  unilateral: boolean;
};

export const CATALOGO_DE_EJERCICIOS: EjercicioDelCatalogo[] = ${JSON.stringify(entradas, null, 2)};

/** Sube cuando cambia el catálogo, para que el sembrado sepa que hay que repasarlo. */
export const VERSION_DEL_CATALOGO = ${entradas.length};
`;

writeFileSync(join(import.meta.dirname, '..', 'src', 'catalogo-ejercicios.ts'), contenido, 'utf8');

const porMusculo = new Map<string, number>();
for (const e of entradas) porMusculo.set(e.musculoPrincipal, (porMusculo.get(e.musculoPrincipal) ?? 0) + 1);

console.log(`Catálogo generado: ${entradas.length} ejercicios`);
console.log(
  [...porMusculo.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([m, n]) => `  ${m}: ${n}`)
    .join('\n'),
);
