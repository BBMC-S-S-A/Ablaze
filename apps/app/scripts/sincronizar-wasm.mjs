// Copia SQLite a public/, que es de donde el worker lo carga.
//
// Dos archivos: el módulo ESM y el binario de WebAssembly. No pasan por Metro —
// `public/db-worker.mjs` los importa tal cual desde el navegador, porque SQLite
// tiene que vivir en un worker y un worker no se puede empaquetar con el resto.
//
// No se versionan: se copian de node_modules en cada arranque para que no puedan
// quedarse desfasados de la versión de la librería, que es el fallo que produce
// errores incomprensibles en tiempo de ejecución.
import { copyFileSync, mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';

const require = createRequire(import.meta.url);
const paquete = dirname(require.resolve('@sqlite.org/sqlite-wasm/package.json'));
const dist = join(paquete, 'dist');
const destino = join(import.meta.dirname, '..', 'public');

mkdirSync(destino, { recursive: true });
copyFileSync(join(dist, 'index.mjs'), join(destino, 'sqlite3.mjs'));
copyFileSync(join(dist, 'sqlite3.wasm'), join(destino, 'sqlite3.wasm'));

const { version } = require('@sqlite.org/sqlite-wasm/package.json');
console.log(`SQLite ${version} copiado a public/ (sqlite3.mjs y sqlite3.wasm)`);
