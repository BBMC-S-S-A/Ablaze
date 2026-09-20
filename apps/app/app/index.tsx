import { MUSCULOS, VISIBILIDADES } from '@ablaze/db';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colores } from '../theme/colors.ts';

/**
 * Pantalla de arranque del andamiaje. Existe para comprobar una sola cosa: que
 * el dominio de packages/db se importa desde la app con sus tipos. Se reemplaza
 * por la bienvenida del onboarding.
 */
export default function Inicio() {
  return (
    <SafeAreaView style={estilos.pantalla}>
      <View style={estilos.contenido}>
        <Text style={estilos.marca}>Ablaze</Text>
        <Text style={estilos.lema}>Entrena, nutre, progresa.</Text>

        <View style={estilos.tarjeta}>
          <Text style={estilos.etiqueta}>Dominio compartido desde @ablaze/db</Text>
          <Text style={estilos.cifra}>{MUSCULOS.length}</Text>
          <Text style={estilos.detalle}>grupos musculares</Text>
          <Text style={estilos.detalle}>
            Visibilidad: {VISIBILIDADES.join(' · ')}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: colores.oscuro,
  },
  contenido: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 8,
  },
  marca: {
    color: colores.fuego,
    fontSize: 44,
    fontWeight: '900',
    letterSpacing: -1.5,
  },
  lema: {
    color: colores.gris,
    fontSize: 16,
  },
  tarjeta: {
    marginTop: 32,
    padding: 20,
    borderRadius: 16,
    backgroundColor: colores.superficie,
    gap: 4,
  },
  etiqueta: {
    color: colores.gris,
    fontSize: 13,
  },
  cifra: {
    color: colores.texto,
    fontSize: 40,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  detalle: {
    color: colores.gris,
    fontSize: 14,
  },
});
