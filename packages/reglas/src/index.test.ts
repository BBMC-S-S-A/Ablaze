import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  DESPROPORCION_MAXIMA,
  SESIONES_PARA_ESTANCAMIENTO,
  evaluar,
  reglaAdherencia,
  reglaEmpujeTiron,
  reglaEstancamiento,
  reglaGrupoMasDescansado,
  reglaMolestias,
  type Contexto,
  type EstadoDeGrupo,
} from './index.ts';

/** Un contexto vacío: sin datos, ninguna regla debería atreverse a sugerir nada. */
function contextoVacio(): Contexto {
  return {
    grupos: [],
    ejercicios: [],
    molestias: [],
    sesionesEstaSemana: 0,
    sesionesPlaneadas: null,
  };
}

function grupo(parcial: Partial<EstadoDeGrupo> & Pick<EstadoDeGrupo, 'musculo'>): EstadoDeGrupo {
  return { horasDesde: null, kilos: 0, series: 0, ...parcial };
}

describe('sin datos', () => {
  it('ninguna regla sugiere nada y todas dicen qué falta', () => {
    const { sugerencias, faltantes } = evaluar(contextoVacio());
    assert.equal(sugerencias.length, 0);
    assert.equal(faltantes.length, 5, 'las cinco reglas deben explicar qué les falta');
    for (const f of faltantes) {
      assert.ok(f.falta.length > 0, `la regla ${f.regla} no dijo qué le falta`);
    }
  });
});

describe('grupo más descansado', () => {
  it('elige el que lleva más horas parado', () => {
    const salida = reglaGrupoMasDescansado({
      ...contextoVacio(),
      grupos: [
        grupo({ musculo: 'pecho', horasDesde: 20 }),
        grupo({ musculo: 'espalda', horasDesde: 120 }),
        grupo({ musculo: 'gemelos', horasDesde: 60 }),
      ],
    });
    assert.ok('titulo' in salida);
    assert.match(salida.titulo, /espalda/);
    assert.match(salida.razon, /5 días/);
  });

  it('ignora los grupos que nunca se han entrenado', () => {
    const salida = reglaGrupoMasDescansado({
      ...contextoVacio(),
      // El cuello nunca se tocó. Proponerlo sería cierto e inútil.
      grupos: [grupo({ musculo: 'cuello' }), grupo({ musculo: 'pecho', horasDesde: 72 })],
    });
    assert.ok('titulo' in salida);
    assert.match(salida.titulo, /pecho/);
  });

  it('no sugiere nada si todo lleva menos de 48 horas', () => {
    const salida = reglaGrupoMasDescansado({
      ...contextoVacio(),
      grupos: [grupo({ musculo: 'pecho', horasDesde: 10 })],
    });
    assert.ok('falta' in salida);
  });
});

describe('estancamiento', () => {
  const sesion = (peso: number | null) => ({
    fecha: new Date('2026-09-01'),
    mejorPesoKg: peso,
    repeticionesTotales: 24,
  });

  it('avisa cuando el peso no se mueve en tres sesiones', () => {
    const salida = reglaEstancamiento({
      ...contextoVacio(),
      ejercicios: [
        {
          exerciseId: 'a',
          nombre: 'Press de banca con barra',
          sesiones: [sesion(60), sesion(60), sesion(60)],
        },
      ],
    });
    assert.ok('titulo' in salida);
    assert.match(salida.titulo, /Press de banca/);
    assert.match(salida.razon, /60 kg/);
  });

  it('no avisa si el peso subió en la última', () => {
    const salida = reglaEstancamiento({
      ...contextoVacio(),
      ejercicios: [
        { exerciseId: 'a', nombre: 'Sentadilla', sesiones: [sesion(60), sesion(60), sesion(65)] },
      ],
    });
    assert.ok('falta' in salida);
  });

  it(`no se pronuncia con menos de ${SESIONES_PARA_ESTANCAMIENTO} sesiones`, () => {
    const salida = reglaEstancamiento({
      ...contextoVacio(),
      ejercicios: [{ exerciseId: 'a', nombre: 'Remo', sesiones: [sesion(60), sesion(60)] }],
    });
    assert.ok('falta' in salida);
    assert.match(salida.falta, /3 sesiones/);
  });

  it('ignora los ejercicios sin peso registrado', () => {
    const salida = reglaEstancamiento({
      ...contextoVacio(),
      ejercicios: [
        { exerciseId: 'a', nombre: 'Dominadas', sesiones: [sesion(null), sesion(null), sesion(null)] },
      ],
    });
    assert.ok('falta' in salida);
  });
});

describe('empuje contra tirón', () => {
  it('avisa cuando el empuje pasa de la proporción', () => {
    const salida = reglaEmpujeTiron({
      ...contextoVacio(),
      grupos: [
        grupo({ musculo: 'pecho', kilos: 3000 }),
        grupo({ musculo: 'espalda', kilos: 1000 }),
      ],
    });
    assert.ok('titulo' in salida);
    assert.match(salida.razon, /3000 kg/);
    assert.match(salida.razon, /1000 kg/);
  });

  it('calla cuando están equilibrados', () => {
    const salida = reglaEmpujeTiron({
      ...contextoVacio(),
      grupos: [
        grupo({ musculo: 'pecho', kilos: 1000 }),
        grupo({ musculo: 'espalda', kilos: 900 }),
      ],
    });
    assert.ok('falta' in salida);
  });

  it(`el límite exacto de ${DESPROPORCION_MAXIMA} a 1 todavía no dispara`, () => {
    const salida = reglaEmpujeTiron({
      ...contextoVacio(),
      grupos: [
        grupo({ musculo: 'pecho', kilos: 2000 }),
        grupo({ musculo: 'espalda', kilos: 1000 }),
      ],
    });
    assert.ok('falta' in salida, 'justo en el límite no debe avisar');
  });

  it('no divide por cero cuando no hay tirón', () => {
    const salida = reglaEmpujeTiron({
      ...contextoVacio(),
      grupos: [grupo({ musculo: 'pecho', kilos: 1500 })],
    });
    assert.ok('titulo' in salida);
    assert.equal(salida.prioridad, 'alta');
  });
});

describe('molestias', () => {
  it('recuerda las activas y no las curadas', () => {
    const salida = reglaMolestias({
      ...contextoVacio(),
      molestias: [
        { zona: 'rodilla', lado: 'derecho', activa: true },
        { zona: 'hombro', lado: 'izquierdo', activa: false },
      ],
    });
    assert.ok('titulo' in salida);
    assert.match(salida.razon, /rodilla/);
    assert.doesNotMatch(salida.razon, /hombro/);
  });

  it('no inventa un diagnóstico', () => {
    const salida = reglaMolestias({
      ...contextoVacio(),
      molestias: [{ zona: 'espalda_baja', lado: 'ambos', activa: true }],
    });
    assert.ok('titulo' in salida);
    // La regla informa y excluye ejercicios; no nombra lesiones ni tratamientos.
    assert.doesNotMatch(salida.razon, /lesi[oó]n|tendinitis|hernia|trat/i);
  });
});

describe('adherencia', () => {
  it('no se pronuncia mientras no haya plan', () => {
    const salida = reglaAdherencia({ ...contextoVacio(), sesionesEstaSemana: 3 });
    assert.ok('falta' in salida);
    assert.match(salida.falta, /Tu semana/);
  });

  it('cuenta lo que falta sin regañar', () => {
    const salida = reglaAdherencia({
      ...contextoVacio(),
      sesionesEstaSemana: 2,
      sesionesPlaneadas: 4,
    });
    assert.ok('titulo' in salida);
    assert.match(salida.titulo, /2 sesiones/);
    // El principio uno del documento: la aplicación nunca regaña.
    assert.doesNotMatch(
      `${salida.titulo} ${salida.razon}`,
      /fallaste|deber[ií]as|incumpl|perdiste|excusa/i,
    );
  });

  it('reconoce la semana cumplida', () => {
    const salida = reglaAdherencia({
      ...contextoVacio(),
      sesionesEstaSemana: 4,
      sesionesPlaneadas: 4,
    });
    assert.ok('titulo' in salida);
    assert.match(salida.titulo, /cumplida/);
  });
});

describe('el conjunto', () => {
  it('ordena por prioridad y toda sugerencia trae razón', () => {
    const { sugerencias } = evaluar({
      grupos: [
        grupo({ musculo: 'pecho', kilos: 3000, horasDesde: 10 }),
        grupo({ musculo: 'espalda', kilos: 500, horasDesde: 100 }),
      ],
      ejercicios: [],
      molestias: [{ zona: 'rodilla', lado: 'derecho', activa: true }],
      sesionesEstaSemana: 1,
      sesionesPlaneadas: 4,
    });

    assert.ok(sugerencias.length >= 2);
    assert.equal(sugerencias[0]?.prioridad, 'alta');
    for (const s of sugerencias) {
      assert.ok(s.razon.trim().length > 0, `«${s.titulo}» no trae razón`);
      assert.ok(s.regla.length > 0);
    }
  });

  it('no hay signos de exclamación en ningún texto', () => {
    const { sugerencias } = evaluar({
      grupos: [grupo({ musculo: 'pecho', kilos: 3000, horasDesde: 100 })],
      ejercicios: [],
      molestias: [{ zona: 'rodilla', lado: 'derecho', activa: true }],
      sesionesEstaSemana: 4,
      sesionesPlaneadas: 4,
    });
    // Principio cinco: los números hablan solos.
    for (const s of sugerencias) {
      assert.doesNotMatch(`${s.titulo} ${s.razon}`, /[!¡]/, `«${s.titulo}» lleva exclamación`);
    }
  });
});
