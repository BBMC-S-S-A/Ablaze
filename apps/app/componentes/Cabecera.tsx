import { StyleSheet, View } from 'react-native';

import { colores, espacio, radio } from '../theme/tokens.ts';
import { Texto } from './Texto.tsx';

type Props = {
  titulo: string;
  subtitulo?: string;
  /** Paso actual del onboarding, para la barra de avance. Desde 1. */
  paso?: number;
  de?: number;
};

export function Cabecera({ titulo, subtitulo, paso, de }: Props) {
  const mostrarAvance = typeof paso === 'number' && typeof de === 'number' && de > 0;

  return (
    <View style={estilos.contenedor}>
      {mostrarAvance ? (
        <View
          style={estilos.carril}
          accessibilityRole="progressbar"
          accessibilityValue={{ min: 0, max: de, now: paso }}
        >
          <View style={[estilos.avance, { width: `${Math.min(100, (paso / de) * 100)}%` }]} />
        </View>
      ) : null}

      <Texto variante="titulo">{titulo}</Texto>

      {subtitulo ? (
        <Texto variante="cuerpo" color="gris">
          {subtitulo}
        </Texto>
      ) : null}
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: { gap: espacio.sm, paddingBottom: espacio.lg },
  carril: {
    height: 3,
    borderRadius: radio.redondo,
    backgroundColor: colores.borde,
    overflow: 'hidden',
    marginBottom: espacio.sm,
  },
  avance: { height: '100%', backgroundColor: colores.fuego },
});
