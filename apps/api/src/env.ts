import { z } from 'zod';

/**
 * La configuración se valida al arrancar y no sobre la marcha: es preferible que
 * el proceso no levante a que caiga a mitad de una petición por una variable que
 * nadie puso en Railway.
 */
const esquema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  // Opcional a propósito: la API tiene que poder arrancar sin base de datos
  // mientras se monta la infraestructura. /health dice si está o no.
  DATABASE_URL: z.string().url().optional(),
});

const resultado = esquema.safeParse(process.env);

if (!resultado.success) {
  console.error('Configuración inválida:', z.treeifyError(resultado.error));
  process.exit(1);
}

export const env = resultado.data;
