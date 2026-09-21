import cors from 'cors';
import express from 'express';

import { cerrarBaseDeDatos, comprobarBaseDeDatos } from './db.ts';
import { env } from './env.ts';

const app = express();

/**
 * Solo la PWA puede llamar a esta API.
 *
 * En desarrollo se deja pasar cualquier origen porque Metro sirve desde puertos
 * que cambian. En producción se cierra al origen de la app: esta API va a
 * guardar historial de entrenamiento y, más adelante, fotos del cuerpo.
 */
app.use(
  cors(
    env.NODE_ENV === 'production'
      ? { origin: env.ORIGEN_DE_LA_APP, credentials: true }
      : {},
  ),
);
app.use(express.json({ limit: '1mb' }));

app.get('/health', async (_req, res) => {
  const baseDeDatos = await comprobarBaseDeDatos();
  res.json({
    estado: baseDeDatos === 'inalcanzable' ? 'degradado' : 'ok',
    baseDeDatos,
    entorno: env.NODE_ENV,
    hora: new Date().toISOString(),
  });
});

const servidor = app.listen(env.PORT, () => {
  console.log(`API de Ablaze escuchando en http://localhost:${env.PORT}`);
});

for (const senal of ['SIGINT', 'SIGTERM'] as const) {
  process.on(senal, () => {
    servidor.close(() => {
      void cerrarBaseDeDatos().then(() => process.exit(0));
    });
  });
}
