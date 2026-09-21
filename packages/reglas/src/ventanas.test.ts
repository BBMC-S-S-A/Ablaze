import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { fusionar, repartirSesiones, ventanasLibres } from './ventanas.ts';

/** Un lunes cualquiera, para que las pruebas no dependan del día que se corran. */
const LUNES = new Date(2026, 8, 21);

function hora(dia: Date, h: number, m = 0): Date {
  const d = new Date(dia);
  d.setHours(h, m, 0, 0);
  return d;
}

function bloque(dia: Date, desde: number, hasta: number) {
  return { inicio: hora(dia, desde), fin: hora(dia, hasta) };
}

const finDelDia = (dia: Date) => {
  const d = new Date(dia);
  d.setDate(d.getDate() + 1);
  d.setHours(0, 0, 0, 0);
  return d;
};

describe('fusionar', () => {
  it('junta los que se pisan', () => {
    const r = fusionar([bloque(LUNES, 8, 12), bloque(LUNES, 10, 14)]);
    assert.equal(r.length, 1);
    assert.equal(r[0]?.inicio.getHours(), 8);
    assert.equal(r[0]?.fin.getHours(), 14);
  });

  it('junta también los que solo se tocan', () => {
    // Entre una clase que acaba a las 10 y un turno que empieza a las 10 no hay
    // un hueco de cero minutos: no hay hueco.
    const r = fusionar([bloque(LUNES, 8, 10), bloque(LUNES, 10, 12)]);
    assert.equal(r.length, 1);
    assert.equal(r[0]?.fin.getHours(), 12);
  });

  it('deja separados los que no se tocan', () => {
    const r = fusionar([bloque(LUNES, 8, 10), bloque(LUNES, 11, 12)]);
    assert.equal(r.length, 2);
  });

  it('descarta los que empiezan y acaban a la misma hora', () => {
    assert.equal(fusionar([bloque(LUNES, 9, 9)]).length, 0);
  });

  it('no depende del orden en que lleguen', () => {
    const a = fusionar([bloque(LUNES, 14, 16), bloque(LUNES, 8, 10)]);
    assert.equal(a[0]?.inicio.getHours(), 8);
  });
});

describe('ventanas libres', () => {
  it('encuentra el hueco entre la universidad y el trabajo', () => {
    const v = ventanasLibres(
      [bloque(LUNES, 7, 11), bloque(LUNES, 14, 18)],
      LUNES,
      finDelDia(LUNES),
      { minutosDeSesion: 60 },
    );
    // Tres: 6-7 antes de la universidad, 11-14 entre medias y 18-23 después.
    // La de 6 a 7 dura 60 justos y el mínimo son 60, así que entra: el corte es
    // «menor que el mínimo», no «menor o igual».
    assert.equal(v.length, 3);
    assert.deepEqual(
      v.map((x) => x.inicio.getHours()),
      [6, 11, 18],
    );
    assert.deepEqual(
      v.map((x) => x.minutos),
      [60, 180, 300],
    );
  });

  it('descuenta el desplazamiento dos veces', () => {
    const v = ventanasLibres([bloque(LUNES, 7, 11), bloque(LUNES, 13, 23)], LUNES, finDelDia(LUNES), {
      minutosDeSesion: 60,
      minutosDeDesplazamiento: 20,
    });
    assert.equal(v.length, 1);
    assert.equal(v[0]?.minutos, 120);
    assert.equal(v[0]?.minutosUtiles, 80, '120 menos 20 de ida y 20 de vuelta');
  });

  it('descarta el hueco que el desplazamiento se come', () => {
    // 90 minutos de hueco, 20 de ida y 20 de vuelta: quedan 50 para una sesión
    // de 60. No sirve, y ofrecerlo sería hacer perder el tiempo.
    const v = ventanasLibres(
      [bloque(LUNES, 6, 11), bloque(LUNES, 12, 30 / 60 + 12), bloque(LUNES, 12.5, 23)],
      LUNES,
      finDelDia(LUNES),
      { minutosDeSesion: 60, minutosDeDesplazamiento: 20 },
    );
    assert.equal(v.length, 0);
  });

  it('respeta las horas de corte del día', () => {
    const v = ventanasLibres([], LUNES, finDelDia(LUNES), {
      minutosDeSesion: 60,
      horaMinima: 8,
      horaMaxima: 20,
    });
    assert.equal(v.length, 1);
    assert.equal(v[0]?.inicio.getHours(), 8);
    assert.equal(v[0]?.fin.getHours(), 20);
    assert.equal(v[0]?.minutos, 12 * 60);
  });

  it('el día que llega hasta medianoche dura lo que dice', () => {
    // De 6 a 24 son 18 horas exactas. Cerrar el día un milisegundo antes de
    // medianoche daba una ventana de 18 h que decía terminar a las 23:00.
    const v = ventanasLibres([], LUNES, finDelDia(LUNES), {
      minutosDeSesion: 60,
      horaMinima: 6,
      horaMaxima: 24,
    });
    assert.equal(v.length, 1);
    assert.equal(v[0]?.minutos, 18 * 60);
    assert.equal(v[0]?.fin.getHours(), 0, 'termina a medianoche');
    assert.equal(v[0]?.fin.getDate(), LUNES.getDate() + 1);
  });

  it('un día entero ocupado no deja ventanas', () => {
    const v = ventanasLibres([bloque(LUNES, 0, 24)], LUNES, finDelDia(LUNES), {
      minutosDeSesion: 30,
    });
    assert.equal(v.length, 0);
  });

  it('recorre varios días', () => {
    const martes = new Date(LUNES);
    martes.setDate(martes.getDate() + 1);
    const miercoles = new Date(LUNES);
    miercoles.setDate(miercoles.getDate() + 2);

    const v = ventanasLibres(
      [bloque(LUNES, 6, 23), bloque(martes, 6, 20)],
      LUNES,
      finDelDia(miercoles),
      { minutosDeSesion: 60 },
    );
    // El lunes está lleno; el martes queda de 20 a 23; el miércoles entero.
    assert.equal(v.length, 2);
    assert.equal(v[0]?.inicio.getDate(), martes.getDate());
    assert.equal(v[1]?.inicio.getDate(), miercoles.getDate());
  });

  it('los bloques solapados no parten el hueco en trozos falsos', () => {
    const v = ventanasLibres(
      [bloque(LUNES, 7, 12), bloque(LUNES, 9, 11), bloque(LUNES, 10, 13)],
      LUNES,
      finDelDia(LUNES),
      { minutosDeSesion: 60 },
    );
    // Los tres bloques se funden en uno de 7 a 13, así que quedan exactamente
    // dos huecos: el de antes y el de después. Si la fusión fallara saldrían
    // trozos falsos entre 9-10, 11-12 y demás.
    assert.equal(v.length, 2);
    assert.deepEqual(
      v.map((x) => x.inicio.getHours()),
      [6, 13],
    );
  });
});

describe('repartir sesiones', () => {
  const martes = new Date(LUNES);
  martes.setDate(martes.getDate() + 1);
  const miercoles = new Date(LUNES);
  miercoles.setDate(miercoles.getDate() + 2);

  it('prefiere días distintos antes que repetir el mismo', () => {
    const ventanas = ventanasLibres(
      [bloque(LUNES, 6, 8), bloque(martes, 6, 8), bloque(miercoles, 6, 8)],
      LUNES,
      finDelDia(miercoles),
      { minutosDeSesion: 60 },
    );
    const elegidas = repartirSesiones(ventanas, 3);
    const dias = new Set(elegidas.map((v) => v.inicio.getDate()));
    assert.equal(dias.size, 3, 'dos sesiones el martes y ninguna el resto no es un plan');
  });

  it('devuelve las elegidas en orden cronológico', () => {
    const ventanas = ventanasLibres([], LUNES, finDelDia(miercoles), { minutosDeSesion: 60 });
    const elegidas = repartirSesiones(ventanas, 2);
    assert.ok(elegidas.length === 2);
    assert.ok(elegidas[0]!.inicio.getTime() < elegidas[1]!.inicio.getTime());
  });

  it('no inventa ventanas cuando no las hay', () => {
    assert.equal(repartirSesiones([], 4).length, 0);
  });

  it('pedir cero devuelve nada', () => {
    const ventanas = ventanasLibres([], LUNES, finDelDia(LUNES), { minutosDeSesion: 60 });
    assert.equal(repartirSesiones(ventanas, 0).length, 0);
  });
});
