import { EQUIPAMIENTOS, MUSCULOS, type Equipamiento, type Musculo } from '@ablaze/db';
import type { Exercise } from '@ablaze/db/sqlite';
import { useCallback, useEffect, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Boton, Cabecera, Campo, Chip, Tarjeta, Texto } from '../componentes/index.ts';
import { crearEjercicio, listarEjercicios } from '../datos/ejercicios.ts';
import { colores, espacio } from '../theme/tokens.ts';

export default function PantallaEjercicios() {
  const [ejercicios, setEjercicios] = useState<Exercise[]>([]);
  const [texto, setTexto] = useState('');
  const [musculo, setMusculo] = useState<Musculo | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creando, setCreando] = useState(false);

  const recargar = useCallback(async () => {
    try {
      setEjercicios(await listarEjercicios({ texto, musculo: musculo ?? undefined }));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setCargando(false);
    }
  }, [texto, musculo]);

  useEffect(() => {
    void recargar();
  }, [recargar]);

  return (
    <SafeAreaView style={estilos.pantalla}>
      <View style={estilos.encabezado}>
        <Cabecera
          titulo="Ejercicios"
          subtitulo={
            cargando ? 'Cargando…' : `${ejercicios.length} de los que puedes registrar hoy.`
          }
        />

        <Campo
          placeholder="Buscar ejercicio"
          value={texto}
          onChangeText={setTexto}
          autoCorrect={false}
        />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={estilos.chips}>
          <Chip etiqueta="Todos" activo={musculo === null} onPress={() => setMusculo(null)} />
          {MUSCULOS.map((m) => (
            <Chip key={m} etiqueta={nombreDeMusculo[m]} activo={musculo === m} onPress={() => setMusculo(m)} />
          ))}
        </ScrollView>

        {error ? (
          <Texto variante="cuerpoMenor" color="fuego">
            {error}
          </Texto>
        ) : null}

        {creando ? (
          <Formulario
            onCancelar={() => setCreando(false)}
            onCreado={async () => {
              setCreando(false);
              await recargar();
            }}
          />
        ) : (
          <Boton variante="secundario" onPress={() => setCreando(true)}>
            Crear un ejercicio mío
          </Boton>
        )}
      </View>

      <FlatList
        data={ejercicios}
        keyExtractor={(e) => e.id}
        contentContainerStyle={estilos.lista}
        ListEmptyComponent={
          cargando ? null : (
            <Texto color="gris">
              Ningún ejercicio coincide. Puedes crear uno con el botón de arriba.
            </Texto>
          )
        }
        renderItem={({ item }) => <Fila ejercicio={item} />}
      />
    </SafeAreaView>
  );
}

function Fila({ ejercicio }: { ejercicio: Exercise }) {
  const secundarios = ejercicio.musculosSecundarios.map((m) => nombreDeMusculo[m]).join(', ');

  return (
    <Tarjeta>
      <View style={estilos.filaTitulo}>
        <Texto variante="interfaz" style={estilos.nombre}>
          {ejercicio.nombre}
        </Texto>
        {ejercicio.userId !== null ? (
          <Texto variante="etiqueta" color="fuego">
            MÍO
          </Texto>
        ) : null}
      </View>
      <Texto variante="cuerpoMenor" color="gris">
        {nombreDeMusculo[ejercicio.musculoPrincipal]}
        {secundarios ? ` · ${secundarios}` : ''}
      </Texto>
      <Texto variante="cuerpoMenor" color="textoTenue">
        {nombreDeEquipamiento[ejercicio.equipamiento]}
        {ejercicio.unilateral ? ' · unilateral' : ''}
      </Texto>
    </Tarjeta>
  );
}

function Formulario({ onCancelar, onCreado }: { onCancelar: () => void; onCreado: () => void }) {
  const [nombre, setNombre] = useState('');
  const [principal, setPrincipal] = useState<Musculo>('pecho');
  const [secundarios, setSecundarios] = useState<Musculo[]>([]);
  const [equipamiento, setEquipamiento] = useState<Equipamiento>('barra');
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  async function guardar() {
    setGuardando(true);
    try {
      await crearEjercicio({
        nombre,
        musculoPrincipal: principal,
        musculosSecundarios: secundarios,
        equipamiento,
      });
      onCreado();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Tarjeta>
      <Campo etiqueta="Nombre" value={nombre} onChangeText={setNombre} placeholder="Press inclinado en Smith" />

      <Texto variante="cuerpoMenor" color="gris">
        Músculo principal
      </Texto>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={estilos.chips}>
        {MUSCULOS.map((m) => (
          <Chip
            key={m}
            etiqueta={nombreDeMusculo[m]}
            activo={principal === m}
            onPress={() => {
              setPrincipal(m);
              setSecundarios((s) => s.filter((x) => x !== m));
            }}
          />
        ))}
      </ScrollView>

      <Texto variante="cuerpoMenor" color="gris">
        Músculos secundarios
      </Texto>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={estilos.chips}>
        {MUSCULOS.filter((m) => m !== principal).map((m) => (
          <Chip
            key={m}
            etiqueta={nombreDeMusculo[m]}
            activo={secundarios.includes(m)}
            onPress={() =>
              setSecundarios((s) => (s.includes(m) ? s.filter((x) => x !== m) : [...s, m]))
            }
          />
        ))}
      </ScrollView>

      <Texto variante="cuerpoMenor" color="gris">
        Equipamiento
      </Texto>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={estilos.chips}>
        {EQUIPAMIENTOS.map((e) => (
          <Chip
            key={e}
            etiqueta={nombreDeEquipamiento[e]}
            activo={equipamiento === e}
            onPress={() => setEquipamiento(e)}
          />
        ))}
      </ScrollView>

      {error ? (
        <Texto variante="cuerpoMenor" color="fuego">
          {error}
        </Texto>
      ) : null}

      <View style={estilos.acciones}>
        <Boton onPress={guardar} cargando={guardando}>
          Guardar
        </Boton>
        <Boton variante="fantasma" onPress={onCancelar}>
          Cancelar
        </Boton>
      </View>
    </Tarjeta>
  );
}

const nombreDeMusculo: Record<Musculo, string> = {
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

const nombreDeEquipamiento: Record<Equipamiento, string> = {
  barra: 'Barra',
  mancuerna: 'Mancuerna',
  maquina: 'Máquina',
  polea: 'Polea',
  peso_corporal: 'Peso corporal',
  kettlebell: 'Kettlebell',
  banda: 'Banda',
  otro: 'Otro',
};

const estilos = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colores.oscuro },
  encabezado: { paddingHorizontal: espacio.xl, paddingTop: espacio.lg, gap: espacio.md },
  chips: { gap: espacio.sm, paddingVertical: espacio.xs },
  lista: { padding: espacio.xl, gap: espacio.sm, paddingBottom: espacio.xxxl },
  filaTitulo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: espacio.sm },
  nombre: { flex: 1 },
  acciones: { gap: espacio.sm, marginTop: espacio.sm },
});
