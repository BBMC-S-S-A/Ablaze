/**
 * Mete las migraciones de SQLite dentro de un archivo TypeScript.
 *
 * En el dispositivo no hay sistema de archivos que leer: la app es un bundle, y
 * `migrations/sqlite/*.sql` no existe ahí. Así que el SQL viaja dentro del
 * código, en orden y con su etiqueta.
 *
 * Lo corre `npm run db:generate` detrás de drizzle-kit, para que el archivo
 * generado no se pueda quedar atrás de las migraciones.
 *
 *   npm run bundle -w @ablaze/db
 */
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const carpeta = join(import.meta.dirname, '..', 'migrations', 'sqlite');
const destino = join(import.meta.dirname, '..', 'src', 'migraciones.sqlite.ts');

type Diario = { entries: { idx: number; tag: string }[] };

const diario = JSON.parse(readFileSync(join(carpeta, 'meta', '_journal.json'), 'utf8')) as Diario;
const archivos = readdirSync(carpeta).filter((f) => f.endsWith('.sql'));

const migraciones = diario.entries
  .sort((a, b) => a.idx - b.idx)
  .map((entrada) => {
    const archivo = archivos.find((f) => f.startsWith(String(entrada.idx).padStart(4, '0')));
    if (!archivo) throw new Error(`Falta el .sql de la migración ${entrada.tag}`);

    const sql = readFileSync(join(carpeta, archivo), 'utf8')
      // drizzle-kit separa las sentencias con esta marca. SQLite ejecuta una por
      // llamada, así que hay que partirlas aquí y no en tiempo de ejecución.
      .split('--> statement-breakpoint')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    return { tag: entrada.tag, sentencias: sql };
  });

const total = migraciones.reduce((n, m) => n + m.sentencias.length, 0);

const contenido = `// Generado por scripts/empaquetar-migraciones.ts — no editar a mano.
// Se regenera con \`npm run db:generate\`.

export type Migracion = {
  /** El nombre que le puso drizzle-kit. Es lo que se guarda como aplicado. */
  tag: string;
  sentencias: string[];
};

export const MIGRACIONES_SQLITE: Migracion[] = ${JSON.stringify(migraciones, null, 2)};
`;

writeFileSync(destino, contenido, 'utf8');
console.log(
  `Empaquetadas ${migraciones.length} migraciones de SQLite (${total} sentencias) en src/migraciones.sqlite.ts`,
);
