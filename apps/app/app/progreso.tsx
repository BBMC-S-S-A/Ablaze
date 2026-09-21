import type { Musculo } from '@ablaze/db';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Cabecera, Chip, Tarjeta, Texto } from '../componentes/index.ts';
import { volumenPorGrupo, type VolumenDeGrupo } from '../datos/analisis.ts';
import {
  ejerciciosEntrenados,
  historialDeEjercicio,
  tendencia,
  type EjercicioEntrenado,
  type Historial,
} from '../datos/historial.ts';
import { colores, espacio, radio } from '../theme/tokens.ts';

/** Qué has movido, qué tienes descansado y cómo va cada ejercicio. */
export default function Progreso() {
  const [grupos, setGrupos] = useState<VolumenDeGrupo[]>([]);
  const [entrenados, setEntrenados] = useState<EjercicioEntrenado[]>([]);
  const [elegido, setElegido] = useState<string | null>(null);
  const [historial, setHistorial] = useState<Historial | null>(null);

  useEffect(() => {
    let vivo = true;
    Promise.all([volumenPorGrupo(7), ejerciciosEntrenados()])
      .then(([v, e]) => {
        if (!vivo) return;
        setGrupos(v);
        setEntrenados(e);
        setElegido(e[0]?.id ?? null);
      })
      .catch(() => {});
    return () => {
      vivo = false;
    };
  }, []);

  useEffect(() => {
    if (!elegido) return;
    let vivo = true;
    historialDeEjercicio(elegido)
      .then((h) => {
        if (vivo) setHistorial(h);
      })
      .catch(() => {});
    return () => {
      vivo = false;
    };
  }, [elegido]);

  const trabajados = grupos.filter((g) => g.series > 0).sort((a, b) => b.kilos - a.kilos);
  const descansados = grupos
    .filter((g) => g.horasDesde === null || g.horasDesde >= 48)
    .sort((a, b) => (b.horasDesde ?? Infinity) - (a.horasDesde ?? Infinity));
  const maximo = Math.max(1, ...trabajados.map((g) => g.kilos));

  return (
    <SafeAreaView style={estilos.pantalla}>
      <ScrollView contentContainerStyle={estilos.contenido}>
        <Cabecera titulo="Progreso" subtitulo="Los últimos siete días." />

        <Tarjeta>
          <Texto variante="etiqueta" color="gris">
            VOLUMEN POR GRUPO
          </Texto>
          {trabajados.length === 0 ? (
            <Texto variante="cuerpoMenor" color="textoTenue">
              Todavía no hay series esta semana.
            </Texto>
          ) : (
            trabajados.map((grupo) => (
              <View key={grupo.musculo} style={estilos.barraFila}>
                <Texto variante="cuerpoMenor" style={estilos.barraEtiqueta}>
                  {NOMBRES[grupo.musculo]}
                </Texto>
                <View style={estilos.carril}>
                  <View style={[estilos.barra, { width: `${(grupo.kilos / maximo) * 100}%` }]} />
                </View>
                <Texto variante="cifra" color="gris" style={estilos.barraCifra}>
                  {grupo.kilos}
                </Texto>
              </View>
            ))
          )}
          <Texto variante="cuerpoMenor" color="textoTenue">
            Kilos movidos. Los músculos secundarios cuentan la mitad que el principal:
            el press de banca trabaja tríceps, pero no como un press francés.
          </Texto>
        </Tarjeta>

        <Tarjeta>
          <Texto variante="etiqueta" color="gris">
            DESCANSADOS
          </Texto>
          <Texto variante="cuerpoMenor" color="gris">
            {descansados.length} de {grupos.length} llevan 48 horas o más sin trabajarse.
          </Texto>
          <View style={estilos.chips}>
            {descansados.slice(0, 10).map((g) => (
              <View key={g.musculo} style={estilos.etiquetaDescanso}>
                <Texto variante="cuerpoMenor" color="gris">
                  {NOMBRES[g.musculo]}
                  {g.horasDesde !== null ? ` · ${g.horasDesde} h` : ''}
                </Texto>
              </View>
            ))}
          </View>
        </Tarjeta>

        {entrenados.length > 0 ? (
          <Tarjeta>
            <Texto variante="etiqueta" color="gris">
              PROGRESIÓN POR EJERCICIO
            </Texto>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={estilos.chips}>
              {entrenados.map((e) => (
                <Chip
                  key={e.id}
                  etiqueta={e.nombre}
                  activo={elegido === e.id}
                  onPress={() => setElegido(e.id)}
                />
              ))}
            </ScrollView>

            {historial ? <Progresion historial={historial} /> : null}
          </Tarjeta>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function Progresion({ historial }: { historial: Historial }) {
  // La curva no se dibuja hasta que signifique algo. Con dos puntos es una raya
  // entre dos números, y una raya entre dos números parece una tendencia.
  if (!historial.hayTendencia) {
    return (
      <View style={estilos.bloque}>
        <Texto variante="cuerpo" color="gris">
          {historial.sesionesQueFaltan === 1
            ? 'Falta un entrenamiento más para que la progresión signifique algo.'
            : `Faltan ${historial.sesionesQueFaltan} entrenamientos para que la progresión signifique algo.`}
        </Texto>
        <Texto variante="cuerpoMenor" color="textoTenue">
          Con dos puntos no hay tendencia, hay dos puntos.
        </Texto>
      </View>
    );
  }

  const cambio = tendencia(historial);

  return (
    <View style={estilos.bloque}>
      {cambio !== null ? (
        <>
          <Texto variante="cifraGrande" color={cambio >= 0 ? 'texto' : 'gris'}>
            {cambio > 0 ? '+' : ''}
            {cambio.toString().replace('.', ',')}%
          </Texto>
          <Texto variante="cuerpoMenor" color="gris">
            en fuerza estimada desde el primer registro. Es una estimación con la
            fórmula de Epley, no una marca medida.
          </Texto>
        </>
      ) : null}

      {historial.dias.map((dia) => (
        <View key={dia.sessionId} style={estilos.dia}>
          <Texto variante="cuerpoMenor" color="gris">
            {dia.fecha.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })}
          </Texto>
          <Texto variante="cifra">
            {dia.mejorPesoKg !== null ? `${dia.mejorPesoKg} kg` : 'Peso corporal'} ·{' '}
            {dia.series} {dia.series === 1 ? 'serie' : 'series'}
          </Texto>
          <Texto variante="cuerpoMenor" color="textoTenue">
            {dia.esfuerzoMedio !== null ? `esf. ${dia.esfuerzoMedio} · ` : ''}
            {dia.estimadoUnaRepeticion !== null ? `~${dia.estimadoUnaRepeticion} kg` : '—'}
          </Texto>
        </View>
      ))}
    </View>
  );
}

const NOMBRES: Record<Musculo, string> = {
  pecho: 'Pecho',
  espalda: 'Espalda',
  hombros: 'Hombros',
  biceps: 'Bíceps',
  triceps: 'Tríceps',
  antebrazos: 'Antebrazos',
  trapecio: 'Trapecio',
  abdomen: 'Abdomen',
  oblicuos: 'Oblicuos',
  lumbares: 'Lumbares',
  gluteos: 'Glúteos',
  aductores: 'Aductores',
  cuadriceps: 'Cuádriceps',
  isquiotibiales: 'Isquiotibiales',
  gemelos: 'Gemelos',
  cuello: 'Cuello',
};

const estilos = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colores.oscuro },
  contenido: { padding: espacio.xl, paddingBottom: espacio.xxxl, gap: espacio.md },
  barraFila: { flexDirection: 'row', alignItems: 'center', gap: espacio.sm },
  barraEtiqueta: { width: 92 },
  barraCifra: { width: 56, textAlign: 'right' },
  carril: { flex: 1, height: 8, borderRadius: radio.redondo, backgroundColor: colores.borde },
  barra: { height: '100%', borderRadius: radio.redondo, backgroundColor: colores.fuego },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: espacio.sm },
  etiquetaDescanso: {
    paddingHorizontal: espacio.md,
    paddingVertical: espacio.xs,
    borderRadius: radio.redondo,
    backgroundColor: colores.superficieAlta,
  },
  bloque: { gap: espacio.xs, marginTop: espacio.sm },
  dia: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: espacio.sm,
    paddingVertical: espacio.xs,
  },
});
