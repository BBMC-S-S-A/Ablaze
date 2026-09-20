import cors from 'cors';
import express from 'express';

import { cerrarBaseDeDatos, comprobarBaseDeDatos } from './db.ts';
import { env } from './env.ts';

const app = express();

app.use(cors());
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
