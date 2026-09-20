import { Pressable, StyleSheet } from 'react-native';

import { colores, espacio, radio } from '../theme/tokens.ts';
import { Texto } from './Texto.tsx';

type Props = {
  etiqueta: string;
  activo: boolean;
  onPress: () => void;
};

/** Filtro de una línea. Se usa en listas largas y en los formularios de clasificación. */
export function Chip({ etiqueta, activo, onPress }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: activo }}
      onPress={onPress}
      style={({ pressed }) => [
        estilos.base,
        activo ? estilos.activo : null,
        pressed ? estilos.pulsado : null,
      ]}
    >
      <Texto variante="cuerpoMenor" color={activo ? 'sobreFuego' : 'gris'}>
        {etiqueta}
      </Texto>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  base: {
    paddingHorizontal: espacio.md,
    paddingVertical: espacio.sm,
    borderRadius: radio.redondo,
    backgroundColor: colores.superficie,
    borderWidth: 1,
    borderColor: colores.borde,
  },
  activo: { backgroundColor: colores.fuego, borderColor: colores.fuego },
  pulsado: { opacity: 0.8 },
});
