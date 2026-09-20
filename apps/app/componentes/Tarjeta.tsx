import { Pressable, StyleSheet, View, type ViewProps } from 'react-native';

import { colores, espacio, radio } from '../theme/tokens.ts';

type Props = ViewProps & {
  /** Sin relleno interior, para tarjetas que contienen una lista a sangre. */
  sinRelleno?: boolean;
  /** Si se pasa, la tarjeta entera es el objetivo de toque. */
  onPress?: () => void;
};

export function Tarjeta({ sinRelleno = false, onPress, style, ...resto }: Props) {
  const estilo = [estilos.base, sinRelleno ? null : estilos.relleno, style];

  // Cuando la tarjeta es pulsable, el objetivo es la tarjeta entera y no un
  // enlace dentro: es más fácil de acertar con el pulgar que un texto.
  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [...estilo, pressed ? estilos.pulsada : null]}
        {...resto}
      />
    );
  }

  return <View style={estilo} {...resto} />;
}

const estilos = StyleSheet.create({
  base: {
    backgroundColor: colores.superficie,
    borderRadius: radio.lg,
    borderWidth: 1,
    borderColor: colores.borde,
    overflow: 'hidden',
  },
  relleno: { padding: espacio.lg, gap: espacio.sm },
  pulsada: { backgroundColor: colores.superficieAlta },
});
