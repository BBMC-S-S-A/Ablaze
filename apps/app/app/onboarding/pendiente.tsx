import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Boton, Cabecera, Tarjeta, Texto } from '../../componentes/index.ts';
import { TOTAL_DE_PASOS } from '../../datos/pasos.ts';
import { colores, espacio } from '../../theme/tokens.ts';

/**
 * Final provisional del onboarding.
 *
 * Existe porque los pasos 4 al 16 todavía no están construidos, y dejar que el
 * botón «Siguiente» lleve a una ruta vacía es peor que decir dónde va la cosa.
 * Se borra cuando exista el paso 4.
 */
export default function Pendiente() {
  const router = useRouter();

  return (
    <SafeAreaView style={estilos.pantalla}>
      <View style={estilos.contenido}>
        <Cabecera
          titulo="Hasta aquí llega por ahora"
          subtitulo="Lo que respondiste ya está guardado en este dispositivo."
          paso={3}
          de={TOTAL_DE_PASOS}
        />

        <Tarjeta>
          <Texto variante="etiqueta" color="gris">
            LO QUE FALTA
          </Texto>
          <Texto variante="cuerpoMenor" color="gris">
            Datos personales y fotos · Tu semana · Tu gimnasio · Molestias ·
            Alimentación · Rutina actual · Cardio · Suplementos · Descanso ·
            Nivel de exigencia · Evaluación inicial
          </Texto>
        </Tarjeta>

        <View style={estilos.acciones}>
          <Boton onPress={() => router.push('/ejercicios')}>Ver los ejercicios</Boton>
          <Boton variante="secundario" onPress={() => router.push('/progreso')}>
            Ver mi progreso
          </Boton>
          <Boton variante="secundario" onPress={() => router.push('/diagnostico')}>
            Estado de la base local
          </Boton>
          <Boton variante="fantasma" onPress={() => router.push('/onboarding/objetivos')}>
            Volver a mis objetivos
          </Boton>
        </View>
      </View>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colores.oscuro },
  contenido: { flex: 1, padding: espacio.xl, gap: espacio.lg },
  acciones: { gap: espacio.sm, marginTop: 'auto' },
});
