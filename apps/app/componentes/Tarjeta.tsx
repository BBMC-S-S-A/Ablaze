import { StyleSheet, View, type ViewProps } from 'react-native';

import { colores, espacio, radio } from '../theme/tokens.ts';

type Props = ViewProps & {
  /** Sin relleno interior, para tarjetas que contienen una lista a sangre. */
  sinRelleno?: boolean;
};

export function Tarjeta({ sinRelleno = false, style, ...resto }: Props) {
  return <View style={[estilos.base, sinRelleno ? null : estilos.relleno, style]} {...resto} />;
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
});
