import type { TipoDeBloque } from '@ablaze/db';
import { timeBlocks, type TimeBlock } from '@ablaze/db/sqlite';
import { ventanasLibres, type Ventana } from '@ablaze/reglas';
import { and, eq, gte, lte, or } from 'drizzle-orm';

import { abrirBaseLocal } from '../basededatos/index.ts';
import { USUARIO_LOCAL_ID } from '../basededatos/sembrar.ts';

/**
 * Los bloques de tiempo: la pieza central del modelo.
 *
 * Una clase de universidad, un turno de trabajo y una sesión de pierna son el
 * mismo registro. Por eso el calendario no es un segundo producto: es una
 * consulta sobre datos que ya existen.
 */

/** La rejilla del mockup va en franjas de dos horas, de 6 a 24. */
export const HORA_MINIMA = 6;
export const HORA_MAXIMA = 24;
export const HORAS_POR_FRANJA = 2;

export const FRANJAS: number[] = Array.from(
  { length: (HORA_MAXIMA - HORA_MINIMA) / HORAS_POR_FRANJA },
  (_, i) => HORA_MINIMA + i * HORAS_POR_FRANJA,
);

/** El lunes de la semana a la que pertenece una fecha. */
export function lunesDeLaSemana(fecha: Date): Date {
  const d = new Date(fecha);
  // getDay() da 0 para domingo; aquí la semana empieza en lunes.
  const desplazamiento = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - desplazamiento);
  d.setHours(0, 0, 0, 0);
  return d;
}

export type BloqueDeLaSemana = {
  /** El id de la fila. Los repetidos comparten el de su original. */
  id: string;
  tipo: TipoDeBloque;
  inicio: Date;
  fin: Date;
  /** Verdadero cuando esta aparición viene de una repetición semanal. */
  proyectado: boolean;
};

/**
 * Los bloques que caen en una semana, ya con las repeticiones desplegadas.
 *
 * Un bloque semanal se guarda una vez y se proyecta sobre cada semana posterior.
 * Guardar una copia por semana llenaría la tabla de filas idénticas y
 * convertiría «cambio mi horario» en «edito cincuenta filas».
 */
export async function bloquesDeLaSemana(lunes: Date): Promise<BloqueDeLaSemana[]> {
  const { db } = await abrirBaseLocal();
  const domingo = new Date(lunes);
  domingo.setDate(domingo.getDate() + 7);

  const filas = await db
    .select()
    .from(timeBlocks)
    .where(
      and(
        eq(timeBlocks.userId, USUARIO_LOCAL_ID),
        or(
          // Los de esta semana concreta.
          and(gte(timeBlocks.inicio, lunes), lte(timeBlocks.inicio, domingo)),
          // Y los semanales que empezaron antes y siguen vigentes.
          and(eq(timeBlocks.repeticion, 'semanal'), lte(timeBlocks.inicio, domingo)),
        ),
      ),
    );

  const salida: BloqueDeLaSemana[] = [];

  for (const fila of filas) {
    const dentroDeLaSemana = fila.inicio >= lunes && fila.inicio < domingo;

    if (fila.repeticion === 'ninguna') {
      if (dentroDeLaSemana) {
        salida.push({ id: fila.id, tipo: fila.tipo, inicio: fila.inicio, fin: fila.fin, proyectado: false });
      }
      continue;
    }

    // Semanal: se proyecta al mismo día y hora de esta semana.
    if (fila.repeticionHasta && fila.repeticionHasta < lunes) continue;

    const diaDeLaSemana = (fila.inicio.getDay() + 6) % 7;
    const inicio = new Date(lunes);
    inicio.setDate(inicio.getDate() + diaDeLaSemana);
    inicio.setHours(fila.inicio.getHours(), fila.inicio.getMinutes(), 0, 0);

    const duracion = fila.fin.getTime() - fila.inicio.getTime();
    salida.push({
      id: fila.id,
      tipo: fila.tipo,
      inicio,
      fin: new Date(inicio.getTime() + duracion),
      proyectado: !dentroDeLaSemana,
    });
  }

  return salida.sort((a, b) => a.inicio.getTime() - b.inicio.getTime());
}

/** Pinta una franja. Los bloques de la rejilla son siempre semanales. */
export async function pintarFranja(dia: Date, hora: number, tipo: TipoDeBloque): Promise<void> {
  const { db } = await abrirBaseLocal();

  const inicio = new Date(dia);
  inicio.setHours(hora, 0, 0, 0);
  const fin = new Date(inicio);
  fin.setHours(hora + HORAS_POR_FRANJA, 0, 0, 0);

  await db.insert(timeBlocks).values({
    id: crypto.randomUUID(),
    userId: USUARIO_LOCAL_ID,
    tipo,
    inicio,
    fin,
    repeticion: 'semanal',
  });
}

export async function borrarBloque(id: string): Promise<void> {
  const { db } = await abrirBaseLocal();
  await db.delete(timeBlocks).where(eq(timeBlocks.id, id));
}

/** Mover un bloque a otro día y otra hora, conservando su duración. */
export async function moverBloque(id: string, dia: Date, hora: number): Promise<void> {
  const { db } = await abrirBaseLocal();
  const [actual] = await db.select().from(timeBlocks).where(eq(timeBlocks.id, id));
  if (!actual) return;

  const duracion = actual.fin.getTime() - actual.inicio.getTime();
  const inicio = new Date(dia);
  inicio.setHours(hora, 0, 0, 0);

  await db
    .update(timeBlocks)
    .set({ inicio, fin: new Date(inicio.getTime() + duracion), actualizadoEn: new Date() })
    .where(eq(timeBlocks.id, id));
}

/** Cuántas sesiones de gimnasio hay planeadas en la semana. */
export function sesionesPlaneadas(bloques: BloqueDeLaSemana[]): number {
  return bloques.filter((b) => b.tipo === 'sesion').length;
}

/**
 * Los huecos de la semana donde cabe entrenar.
 *
 * Los bloques de tipo «libre» no ocupan: el usuario los pinta justamente para
 * decir que ahí no hay nada. Los de gimnasio tampoco, porque ya son la sesión.
 */
export async function ventanasDeLaSemana(
  lunes: Date,
  minutosDeSesion = 60,
  minutosDeDesplazamiento = 0,
): Promise<Ventana[]> {
  const bloques = await bloquesDeLaSemana(lunes);
  const ocupado = bloques
    .filter((b) => b.tipo !== 'libre' && b.tipo !== 'sesion')
    .map((b) => ({ inicio: b.inicio, fin: b.fin }));

  const domingo = new Date(lunes);
  domingo.setDate(domingo.getDate() + 7);

  return ventanasLibres(ocupado, lunes, domingo, {
    minutosDeSesion,
    minutosDeDesplazamiento,
    horaMinima: HORA_MINIMA,
    horaMaxima: HORA_MAXIMA,
  });
}

export type { TimeBlock };
