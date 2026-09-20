import type { Motor } from './motor.tipos.ts';

/**
 * Cliente del worker que tiene la base.
 *
 * Aquí no se importa SQLite: el motor vive en `public/db-worker.mjs`, fuera del
 * bundle, porque `createSyncAccessHandle` —lo que OPFS necesita para escribir—
 * solo existe dentro de un worker dedicado.
 *
 * Esto es únicamente el otro extremo del cable: manda mensajes numerados y
 * resuelve la promesa que corresponda.
 */

type Respuesta = { id: number; ok: true; resultado: unknown } | { id: number; ok: false; error: string };

type DatosDeApertura = {
  almacenamiento: Motor['almacenamiento'];
  persistente: boolean;
  motivo?: string;
};

export async function abrirMotor(): Promise<Motor> {
  const worker = new Worker('/db-worker.mjs', { type: 'module' });

  let siguienteId = 0;
  const pendientes = new Map<number, { resolver: (v: unknown) => void; rechazar: (e: Error) => void }>();

  worker.onmessage = (evento: MessageEvent<Respuesta>) => {
    const respuesta = evento.data;
    const pendiente = pendientes.get(respuesta.id);
    if (!pendiente) return;
    pendientes.delete(respuesta.id);
    if (respuesta.ok) pendiente.resolver(respuesta.resultado);
    else pendiente.rechazar(new Error(respuesta.error));
  };

  worker.onerror = (evento) => {
    // Si el worker se cae, todo lo que estuviera esperando se queda colgado
    // para siempre. Es preferible fallar en voz alta.
    const error = new Error(`El worker de la base local falló: ${evento.message}`);
    for (const [, pendiente] of pendientes) pendiente.rechazar(error);
    pendientes.clear();
  };

  function pedir<T>(mensaje: Record<string, unknown>): Promise<T> {
    const id = siguienteId++;
    return new Promise<T>((resolver, rechazar) => {
      pendientes.set(id, { resolver: resolver as (v: unknown) => void, rechazar });
      worker.postMessage({ id, ...mensaje });
    });
  }

  const apertura = await pedir<DatosDeApertura>({ tipo: 'abrir' });

  return {
    almacenamiento: apertura.almacenamiento,
    persistente: apertura.persistente,
    motivo: apertura.motivo,
    async ejecutar(sql, parametros) {
      return pedir<unknown[][]>({ tipo: 'ejecutar', sql, parametros });
    },
    async cerrar() {
      await pedir({ tipo: 'cerrar' });
      worker.terminate();
    },
  };
}
