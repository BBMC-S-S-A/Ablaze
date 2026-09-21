import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { UMBRALES, calcularLlama, evaluarSemana, type SemanaDeLlama } from './llama.ts';

let contador = 0;
function semana(planeadas: number, cumplidas: number, descansos = 0): SemanaDeLlama {
  // Las fechas solo tienen que ordenarse; el cálculo no mira el calendario.
  const d = new Date(2026, 0, 5 + contador++ * 7);
  return {
    semanaInicio: d.toISOString().slice(0, 10),
    sesionesPlaneadas: planeadas,
    sesionesCumplidas: cumplidas,
    descansosPlaneados: descansos,
  };
}

function reiniciar() {
  contador = 0;
}

describe('cómo le fue a una semana', () => {
  it('cuatro de cuatro la hacen crecer', () => {
    assert.equal(evaluarSemana(semana(4, 4)), 'cumplida');
  });

  it('tres de cuatro la mantienen', () => {
    assert.equal(evaluarSemana(semana(4, 3)), 'mantenida');
  });

  it('cero la baja', () => {
    assert.equal(evaluarSemana(semana(4, 0)), 'bajada');
  });

  it('una de cuatro mantiene, no baja', () => {
    // El documento solo dice que el cero baja. Hacer algo no puede salir peor
    // parado que la mitad de no hacer nada, y la aplicación no regaña.
    assert.equal(evaluarSemana(semana(4, 1)), 'mantenida');
  });

  it('hacer más de lo planeado también cumple', () => {
    assert.equal(evaluarSemana(semana(3, 5)), 'cumplida');
  });

  it('una semana de descanso planificado no la toca', () => {
    // Principio del documento: descansar es parte de entrenar, y un sistema que
    // castiga el descanso enseña a entrenar mal.
    assert.equal(evaluarSemana(semana(0, 0, 7)), 'mantenida');
  });

  it('sin plan no hay nada contra qué medir', () => {
    assert.equal(evaluarSemana(semana(0, 0)), 'mantenida');
  });
});

describe('el nivel', () => {
  it('empieza en chispa sin historial', () => {
    const l = calcularLlama([]);
    assert.equal(l.nivel, 1);
    assert.equal(l.nombre, 'chispa');
    assert.equal(l.progreso, 0);
  });

  it('sube a brasa tras cuatro semanas cumplidas', () => {
    reiniciar();
    const l = calcularLlama([semana(3, 3), semana(3, 3), semana(3, 3), semana(3, 3)]);
    assert.equal(l.progreso, 4);
    assert.equal(l.nombre, 'brasa');
  });

  it('dice cuántas semanas faltan para la siguiente', () => {
    reiniciar();
    const l = calcularLlama([semana(3, 3), semana(3, 3)]);
    assert.equal(l.nombre, 'chispa');
    assert.equal(l.semanasParaSubir, 2, 'de 2 a los 4 de brasa');
  });

  it('en el último nivel ya no queda nada que subir', () => {
    reiniciar();
    const l = calcularLlama(Array.from({ length: 30 }, () => semana(3, 3)));
    assert.equal(l.nombre, 'incendio');
    assert.equal(l.semanasParaSubir, null);
  });

  it('las semanas a medias no suben ni bajan', () => {
    reiniciar();
    const l = calcularLlama([semana(4, 4), semana(4, 2), semana(4, 3), semana(4, 1)]);
    assert.equal(l.progreso, 1, 'solo la primera contó');
  });
});

describe('cuando se deja de ir', () => {
  it('baja gradualmente, no de golpe', () => {
    reiniciar();
    const cumplidas = Array.from({ length: 8 }, () => semana(3, 3));
    const conDos = calcularLlama([...cumplidas, semana(3, 0), semana(3, 0)]);
    assert.equal(conDos.progreso, 6, 'ocho cumplidas menos dos vacías');
    // No existe el momento en que se pierde todo de golpe.
    assert.ok(conDos.progreso > 0);
  });

  it('tras ocho semanas sin entrenar baja, pero no por debajo del piso', () => {
    reiniciar();
    // Llega a Llama: 8 semanas cumplidas.
    const cumplidas = Array.from({ length: 8 }, () => semana(3, 3));
    const vacias = Array.from({ length: 8 }, () => semana(3, 0));
    const l = calcularLlama([...cumplidas, ...vacias]);

    assert.equal(l.nombre, 'brasa', 'quien llegó a llama encuentra una brasa, no cenizas');
    assert.equal(l.progreso, UMBRALES[1], 'el piso es el umbral de brasa');
  });

  it('la llama piloto no se apaga jamás', () => {
    reiniciar();
    const l = calcularLlama(Array.from({ length: 30 }, () => semana(4, 0)));
    assert.equal(l.nivel, 1);
    assert.equal(l.nombre, 'chispa');
    assert.equal(l.progreso, 0, 'nunca baja de cero');
  });

  it('quien solo llegó a brasa vuelve a chispa, no más abajo', () => {
    reiniciar();
    const l = calcularLlama([
      ...Array.from({ length: 4 }, () => semana(3, 3)),
      ...Array.from({ length: 10 }, () => semana(3, 0)),
    ]);
    assert.equal(l.nombre, 'chispa');
    assert.equal(l.progreso, 0);
  });

  it('el piso queda un nivel por debajo del más alto alcanzado', () => {
    reiniciar();
    // 12 semanas cumplidas: hoguera, nivel 4. El piso queda en llama, nivel 3.
    const l = calcularLlama(Array.from({ length: 12 }, () => semana(3, 3)));
    assert.equal(l.nivel, 4);
    assert.equal(l.nivelPiso, 3);
  });

  it('una semana de descanso planificado no baja nada aunque no se entrene', () => {
    reiniciar();
    const l = calcularLlama([
      ...Array.from({ length: 4 }, () => semana(3, 3)),
      semana(0, 0, 7),
      semana(0, 0, 7),
    ]);
    assert.equal(l.progreso, 4, 'las dos semanas de descanso no restaron');
    assert.equal(l.nombre, 'brasa');
  });
});

describe('el orden no importa', () => {
  it('llegan desordenadas y da lo mismo', () => {
    reiniciar();
    const a = semana(3, 3);
    const b = semana(3, 0);
    const c = semana(3, 3);
    assert.equal(calcularLlama([a, b, c]).progreso, calcularLlama([c, a, b]).progreso);
  });
});
