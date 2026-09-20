import { COMPROMISOS, type Compromiso } from '@ablaze/db';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Boton, Cabecera, Opcion } from '../../componentes/index.ts';
import { TOTAL_DE_PASOS } from '../../datos/pasos.ts';
import { guardarPaso, leerPerfil } from '../../datos/perfil.ts';
import { colores, espacio } from '../../theme/tokens.ts';

/** Paso 3 de 16. Selección única. */
export default function CompromisoPaso() {
  const router = useRouter();
  const [elegido, setElegido] = useState<Compromiso | null>(null);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    let vivo = true;
    leerPerfil()
      .then((perfil) => {
        if (vivo) setElegido(perfil?.compromiso ?? null);
      })
      .catch(() => {});
    return () => {
      vivo = false;
    };
  }, []);

  async function siguiente() {
    if (!elegido) return;
    setGuardando(true);
    await guardarPaso(3, { compromiso: elegido });
    router.push('/onboarding/pendiente');
  }

  return (
    <SafeAreaView style={estilos.pantalla}>
      <ScrollView contentContainerStyle={estilos.contenido}>
        <Cabecera
          titulo="¿Qué tan importante es este objetivo para ti?"
          subtitulo="Esto ajusta cuánto interviene la aplicación, no cuánto se te exige."
          paso={3}
          de={TOTAL_DE_PASOS}
        />

        <View style={estilos.lista}>
          {COMPROMISOS.map((compromiso) => (
            <Opcion
              key={compromiso}
              modo="unica"
              etiqueta={ETIQUETAS[compromiso]}
              descripcion={DESCRIPCIONES[compromiso]}
              seleccionada={elegido === compromiso}
              onPress={() => setElegido(compromiso)}
            />
          ))}
        </View>
      </ScrollView>

      <View style={estilos.pie}>
        <Boton onPress={siguiente} deshabilitado={elegido === null} cargando={guardando}>
          Siguiente
        </Boton>
      </View>
    </SafeAreaView>
  );
}

const ETIQUETAS: Record<Compromiso, string> = {
  intentarlo: 'Solo quiero intentarlo',
  verlo_progresar: 'Quiero verlo progresar',
  comprometerme: 'Quiero comprometerme de verdad',
};

/**
 * Las descripciones dicen qué cambia de verdad. Sin ellas la pregunta se lee
 * como un juicio sobre la fuerza de voluntad de quien responde, y la aplicación
 * no regaña.
 */
const DESCRIPCIONES: Record<Compromiso, string> = {
  intentarlo: 'Menos recordatorios y un plan más suelto.',
  verlo_progresar: 'Un plan semanal y aviso cuando algo lleve tiempo estancado.',
  comprometerme: 'Replanificación cuando falles una sesión y seguimiento más fino.',
};

const estilos = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colores.oscuro },
  contenido: { padding: espacio.xl, paddingBottom: espacio.lg },
  lista: { gap: espacio.sm },
  pie: { padding: espacio.xl, paddingTop: espacio.md },
});
