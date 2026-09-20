import type { Session } from '@ablaze/db/sqlite';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Boton, Cabecera, Tarjeta, Texto } from '../../componentes/index.ts';
import { seriesDeLaSesion, type SerieConEjercicio } from '../../datos/series.ts';
import { descartarSesion, sesionEnCurso, terminarSesion } from '../../datos/sesiones.ts';
import { colores, espacio } from '../../theme/tokens.ts';

/** El entrenamiento que está pasando ahora: qué llevas hecho y cómo cerrarlo. */
export default function Sesion() {
  const router = useRouter();
  const [sesion, setSesion] = useState<Session | null>(null);
  const [series, setSeries] = useState<SerieConEjercicio[]>([]);
  const [cargando, setCargando] = useState(true);
  const [trabajando, setTrabajando] = useState(false);

  const cargar = useCallback(async () => {
    const actual = await sesionEnCurso();
    setSesion(actual);
    setSeries(actual ? await seriesDeLaSesion(actual.id) : []);
    setCargando(false);
  }, []);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  async function finalizar() {
    if (!sesion) return;
    setTrabajando(true);
    // Una sesión sin series no es un entrenamiento, es haber abierto la app por
    // error. No tiene por qué quedarse en el historial.
    if (series.length === 0) await descartarSesion(sesion.id);
    else await terminarSesion(sesion.id);
    setTrabajando(false);
    router.replace('/ejercicios');
  }

  if (cargando) {
    return (
      <SafeAreaView style={estilos.pantalla}>
        <View style={estilos.contenido}>
          <Texto color="gris">Cargando…</Texto>
        </View>
      </SafeAreaView>
    );
  }

  if (!sesion) {
    return (
      <SafeAreaView style={estilos.pantalla}>
        <View style={estilos.contenido}>
          <Cabecera
            titulo="No hay entrenamiento abierto"
            subtitulo="Se abre solo al registrar la primera serie de un ejercicio."
          />
          <Boton onPress={() => router.push('/ejercicios')}>Elegir un ejercicio</Boton>
        </View>
      </SafeAreaView>
    );
  }

  const porEjercicio = agrupar(series);
  const volumen = series.reduce((kg, s) => kg + (s.pesoKg ?? 0) * s.repeticiones, 0);

  return (
    <SafeAreaView style={estilos.pantalla}>
      <ScrollView contentContainerStyle={estilos.contenido}>
        <Cabecera
          titulo="Entrenamiento de hoy"
          // Sin punto final: el formato de hora en español ya trae el suyo en
          // «p. m.», y encadenarlos da «06:52 p. m..».
          subtitulo={`Empezó a las ${sesion.inicio.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}`}
        />

        <Tarjeta>
          <View style={estilos.resumen}>
            <Dato valor={String(porEjercicio.length)} etiqueta="ejercicios" />
            <Dato valor={String(series.length)} etiqueta="series" />
            <Dato valor={`${Math.round(volumen)}`} etiqueta="kg de volumen" />
          </View>
        </Tarjeta>

        {porEjercicio.map((grupo) => (
          <Tarjeta key={grupo.exerciseId}>
            <Texto variante="interfaz">{grupo.nombre}</Texto>
            {grupo.series.map((serie, indice) => (
              <Texto key={serie.id} variante="cifra" color="gris">
                {indice + 1}. {serie.pesoKg ? `${serie.pesoKg} kg` : 'Peso corporal'} ×{' '}
                {serie.repeticiones}
              </Texto>
            ))}
            <Boton
              variante="fantasma"
              onPress={() => router.push(`/sesion/${grupo.exerciseId}` as never)}
            >
              Seguir con este
            </Boton>
          </Tarjeta>
        ))}

        <View style={estilos.acciones}>
          <Boton variante="secundario" onPress={() => router.push('/ejercicios')}>
            Añadir otro ejercicio
          </Boton>
          <Boton onPress={finalizar} cargando={trabajando}>
            {series.length === 0 ? 'Descartar' : 'Finalizar entrenamiento'}
          </Boton>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Dato({ valor, etiqueta }: { valor: string; etiqueta: string }) {
  return (
    <View style={estilos.dato}>
      <Texto variante="cifraGrande">{valor}</Texto>
      <Texto variante="cuerpoMenor" color="gris">
        {etiqueta}
      </Texto>
    </View>
  );
}

type Grupo = { exerciseId: string; nombre: string; series: SerieConEjercicio[] };

/** Agrupa por ejercicio conservando el orden en que aparecieron en la sesión. */
function agrupar(series: SerieConEjercicio[]): Grupo[] {
  const grupos: Grupo[] = [];
  for (const serie of series) {
    const existente = grupos.find((g) => g.exerciseId === serie.exerciseId);
    if (existente) existente.series.push(serie);
    else
      grupos.push({
        exerciseId: serie.exerciseId,
        nombre: serie.nombreDelEjercicio,
        series: [serie],
      });
  }
  return grupos;
}

const estilos = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colores.oscuro },
  contenido: { padding: espacio.xl, paddingBottom: espacio.xxxl, gap: espacio.md },
  resumen: { flexDirection: 'row', justifyContent: 'space-between', gap: espacio.md },
  dato: { alignItems: 'center', gap: 2 },
  acciones: { gap: espacio.sm, marginTop: espacio.lg },
});
