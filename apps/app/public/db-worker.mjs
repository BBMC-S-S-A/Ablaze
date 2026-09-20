/**
 * El worker que es dueño de la base local.
 *
 * SQLite vive aquí y no en el hilo principal por una razón de la plataforma, no
 * de estilo: `FileSystemFileHandle.createSyncAccessHandle` —lo que necesita la
 * VFS de OPFS para escribir— solo existe dentro de un worker dedicado. En el
 * hilo principal está sencillamente `undefined`, y SQLite cae a memoria.
 *
 * Efecto secundario bueno: las consultas no bloquean la interfaz.
 *
 * Este archivo NO pasa por Metro. Es un módulo ESM que el navegador carga tal
 * cual desde public/, junto a sqlite3.mjs y sqlite3.wasm, que copia ahí
 * `npm run wasm`. Por eso no tiene imports de node_modules ni sintaxis que haya
 * que compilar.
 */
import sqlite3InitModule from './sqlite3.mjs';

const NOMBRE_DEL_ARCHIVO = '/ablaze.db';

let db = null;
let almacenamiento = 'memoria';
let persistente = false;
let motivo;

async function abrir() {
  const sqlite3 = await sqlite3InitModule({
    locateFile: () => '/sqlite3.wasm',
    print: () => {},
    printErr: (mensaje) => console.warn('[sqlite]', mensaje),
  });

  try {
    // opfs-sahpool y no la VFS «opfs» normal: aquella necesita SharedArrayBuffer,
    // y eso obliga a servir la app con cabeceras COOP y COEP, que además rompen
    // la carga de recursos de otros orígenes.
    const pool = await sqlite3.installOpfsSAHPoolVfs({ name: 'ablaze' });
    db = new pool.OpfsSAHPoolDb(NOMBRE_DEL_ARCHIVO);
    almacenamiento = 'opfs';
    persistente = true;
  } catch (error) {
    // La app sigue funcionando, pero en memoria. Quien la use tiene que
    // enterarse: la interfaz lee estos campos para avisarlo.
    db = new sqlite3.oo1.DB(':memory:', 'c');
    almacenamiento = 'memoria';
    persistente = false;
    motivo = error instanceof Error ? error.message : String(error);
  }

  // Sin esto SQLite ignora las claves foráneas y los ON DELETE CASCADE del
  // esquema son decorativos. Hay que pedirlo en cada conexión.
  db.exec('PRAGMA foreign_keys = ON;');

  return { almacenamiento, persistente, motivo };
}

function ejecutar(sql, parametros) {
  return db.exec({
    sql,
    bind: parametros,
    rowMode: 'array',
    returnValue: 'resultRows',
  });
}

self.onmessage = async (evento) => {
  const { id, tipo, sql, parametros } = evento.data;
  try {
    let resultado;
    if (tipo === 'abrir') resultado = await abrir();
    else if (tipo === 'ejecutar') resultado = ejecutar(sql, parametros ?? []);
    else if (tipo === 'cerrar') {
      db?.close();
      db = null;
      resultado = null;
    } else throw new Error(`Mensaje desconocido: ${tipo}`);

    self.postMessage({ id, ok: true, resultado });
  } catch (error) {
    self.postMessage({
      id,
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    });
  }
};
