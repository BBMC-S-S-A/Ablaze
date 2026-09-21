import type { Exercise, Session, Set } from '@ablaze/db/sqlite';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Boton, Chip, Contador, Texto } from '../../componentes/index.ts';
import { obtenerEjercicio, pasoDePeso } from '../../datos/ejercicios.ts';
import {
  borrarSerie,
  corregirSerie,
  registrarSerie,
  seriesDelEjercicio,
  ultimaSerieDe,
} from '../../datos/series.ts';
import { asegurarSesion } from '../../datos/sesiones.ts';
import { colores, espacio, radio } from '../../theme/tokens.ts';

/**
 * Registrar series de un ejercicio.
 *
 * Es la razón por la que alguien abre la aplicación cuatro veces por semana. Si
 * esto no es excelente, nada más importa.
 *
 * Dos reglas gobiernan la pantalla y no se negocian:
 *
 * 1. **Una serie repetida es un toque.** El peso y las repeticiones llegan
 *    precargados de la última vez que se hizo este ejercicio, así que registrar
 *    otra igual es pulsar el botón y ya.
 * 2. **Todo lo que se toca está abajo.** Arriba solo hay cosas que se leen. Esto
 *    se usa de pie, con una mano y con las manos sudadas.
 */
export default function RegistroDeSerie() {
  const { ejercicioId } = useLocalSearchParams<{ ejercicioId: string }>();
  const router = useRouter();

  const [ejercicio, setEjercicio] = useState<Exercise | null>(null);
  const [sesion, setSesion] = useState<Session | null>(null);
  const [series, setSeries] = useState<Set[]>([]);
  const [referencia, setReferencia] = useState<Set | null>(null);

  const [peso, setPeso] = useState(0);
  const [repeticiones, setRepeticiones] = useState(8);
  const [esfuerzo, setEsfuerzo] = useState<number | null>(null);
  const [editando, setEditando] = useState<string | null>(null);
  const [trabajando, setTrabajando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    if (!ejercicioId) return;
    const [ej, ses] = await Promise.all([obtenerEjercicio(ejercicioId), asegurarSesion()]);
    // La referencia deja fuera la sesión de hoy: «la última vez» es el
    // entrenamiento anterior, no la serie que acabas de anotar.
    const ultima = await ultimaSerieDe(ejercicioId, ses.id);
    setEjercicio(ej);
    setSesion(ses);
    setReferencia(ultima);
    setSeries(await seriesDelEjercicio(ses.id, ejercicioId));

    // Precarga: lo de la última vez. Si nunca se hizo, algo razonable en vez de
    // cero, que obligaría a subir a pulsos desde abajo.
    setPeso(ultima?.pesoKg ?? 0);
    setRepeticiones(ultima?.repeticiones ?? 8);
  }, [ejercicioId]);

  useEffect(() => {
    cargar().catch((e: unknown) => setError(e instanceof Error ? e.message : String(e)));
  }, [cargar]);

  async function registrar() {
    if (!sesion || !ejercicioId) return;
    setTrabajando(true);
    setError(null);
    try {
      if (editando) {
        await corregirSerie(editando, { repeticiones, pesoKg: peso > 0 ? peso : null, esfuerzo });
        setEditando(null);
      } else {
        await registrarSerie({
          sessionId: sesion.id,
          exerciseId: ejercicioId,
          repeticiones,
          pesoKg: peso > 0 ? peso : null,
          esfuerzo,
        });
      }
      setSeries(await seriesDelEjercicio(sesion.id, ejercicioId));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setTrabajando(false);
    }
  }

  function empezarACorregir(serie: Set) {
    setEditando(serie.id);
    setPeso(serie.pesoKg ?? 0);
    setRepeticiones(serie.repeticiones);
    setEsfuerzo(serie.esfuerzo);
  }

  function cancelarCorreccion() {
    setEditando(null);
    setPeso(referencia?.pesoKg ?? 0);
    setRepeticiones(referencia?.repeticiones ?? 8);
  }

  async function borrar() {
    if (!editando || !sesion || !ejercicioId) return;
    setTrabajando(true);
    try {
      await borrarSerie(editando);
      setEditando(null);
      setSeries(await seriesDelEjercicio(sesion.id, ejercicioId));
      setPeso(referencia?.pesoKg ?? 0);
      setRepeticiones(referencia?.repeticiones ?? 8);
    } finally {
      setTrabajando(false);
    }
  }

  const paso = ejercicio ? pasoDePeso(ejercicio.equipamiento) : 2.5;

  return (
    <SafeAreaView style={estilos.pantalla}>
      {/* Zona de lectura. Nada de esto se toca. */}
      <View style={estilos.cabecera}>
        <Texto variante="encabezado" numberOfLines={2}>
          {ejercicio?.nombre ?? '…'}
        </Texto>
        <Texto variante="cuerpoMenor" color="gris">
          {referencia
            ? `La última vez: ${formatearPeso(referencia.pesoKg)} × ${referencia.repeticiones}`
            : 'Primera vez que registras este ejercicio'}
        </Texto>
      </View>

      <ScrollView contentContainerStyle={estilos.series}>
        {series.length === 0 ? (
          <Texto variante="cuerpoMenor" color="textoTenue">
            Todavía no has anotado ninguna serie de este ejercicio hoy.
          </Texto>
        ) : (
          series.map((serie, indice) => (
            <Pressable
              key={serie.id}
              accessibilityRole="button"
              accessibilityLabel={`Corregir la serie ${indice + 1}`}
              onPress={() => empezarACorregir(serie)}
              style={[estilos.serie, editando === serie.id ? estilos.serieEditando : null]}
            >
              <Texto variante="cuerpoMenor" color="gris">
                {indice + 1}
              </Texto>
              <Texto variante="cifra">
                {formatearPeso(serie.pesoKg)} × {serie.repeticiones}
              </Texto>
              <Texto variante="cuerpoMenor" color="textoTenue">
                {editando === serie.id
                  ? 'corrigiendo'
                  : serie.esfuerzo !== null
                    ? `esfuerzo ${serie.esfuerzo}`
                    : 'tocar para corregir'}
              </Texto>
            </Pressable>
          ))
        )}
      </ScrollView>

      {/* Zona del pulgar. Todo lo interactivo vive aquí abajo. */}
      <View style={estilos.controles}>
        {error ? (
          <Texto variante="cuerpoMenor" color="fuego">
            {error}
          </Texto>
        ) : null}

        <Contador
          etiqueta="Peso"
          valor={peso}
          onChange={setPeso}
          paso={paso}
          sufijo={peso === 0 ? 'peso corporal' : 'kg'}
          decimales={paso % 1 === 0 ? 0 : 1}
          maximo={500}
        />

        <Contador
          etiqueta="Repeticiones"
          valor={repeticiones}
          onChange={setRepeticiones}
          minimo={1}
          maximo={100}
        />

        {/* Opcional a propósito: no entra en los toques que cuesta registrar
            una serie. Quien no lo use no lo paga. */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={estilos.esfuerzo}>
          <Texto variante="cuerpoMenor" color="gris">
            Esfuerzo
          </Texto>
          {[6, 7, 8, 9, 10].map((n) => (
            <Chip
              key={n}
              etiqueta={String(n)}
              activo={esfuerzo === n}
              onPress={() => setEsfuerzo(esfuerzo === n ? null : n)}
            />
          ))}
        </ScrollView>

        <Boton onPress={registrar} cargando={trabajando}>
          {editando ? 'Guardar cambios' : 'Registrar serie'}
        </Boton>

        {editando ? (
          <View style={estilos.correccion}>
            <Boton variante="secundario" onPress={cancelarCorreccion}>
              Cancelar
            </Boton>
            <Boton variante="fantasma" onPress={borrar}>
              Borrar esta serie
            </Boton>
          </View>
        ) : (
          <Boton variante="fantasma" onPress={() => router.push('/sesion')}>
            Ver el entrenamiento
          </Boton>
        )}
      </View>
    </SafeAreaView>
  );
}

function formatearPeso(kg: number | null): string {
  if (kg === null || kg === 0) return 'Peso corporal';
  return `${kg.toString().replace('.', ',')} kg`;
}

const estilos = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colores.oscuro },
  cabecera: { paddingHorizontal: espacio.xl, paddingTop: espacio.md, gap: espacio.xs },
  series: { padding: espacio.xl, gap: espacio.sm },
  serie: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: espacio.md,
    paddingHorizontal: espacio.lg,
    paddingVertical: espacio.md,
    borderRadius: radio.md,
    backgroundColor: colores.superficie,
    borderWidth: 1,
    borderColor: colores.borde,
  },
  serieEditando: { borderColor: colores.fuego },
  controles: {
    padding: espacio.xl,
    paddingTop: espacio.lg,
    gap: espacio.md,
    borderTopWidth: 1,
    borderTopColor: colores.borde,
    backgroundColor: colores.oscuro,
  },
  correccion: { gap: espacio.sm },
  esfuerzo: { gap: espacio.sm, alignItems: 'center' },
});
