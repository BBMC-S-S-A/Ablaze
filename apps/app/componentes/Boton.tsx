import { ActivityIndicator, Pressable, StyleSheet, View, type ViewStyle } from 'react-native';

import { TOQUE_MINIMO, colores, espacio, radio, textos } from '../theme/tokens.ts';
import { Texto } from './Texto.tsx';

type Variante = 'primario' | 'secundario' | 'fantasma';

type Props = {
  children: string;
  onPress?: () => void;
  variante?: Variante;
  deshabilitado?: boolean;
  cargando?: boolean;
  /** Ocupa todo el ancho. Es lo normal en el onboarding. */
  ancho?: boolean;
  style?: ViewStyle;
};

export function Boton({
  children,
  onPress,
  variante = 'primario',
  deshabilitado = false,
  cargando = false,
  ancho = true,
  style,
}: Props) {
  const inactivo = deshabilitado || cargando;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: inactivo, busy: cargando }}
      disabled={inactivo}
      onPress={onPress}
      style={({ pressed }) => [
        estilos.base,
        estilos[variante],
        ancho ? estilos.ancho : null,
        // Sin animación de escala: se pulsa con el pulgar y el dedo ya tapa el
        // botón. Lo que hace falta es que cambie el color, no que se mueva.
        pressed && !inactivo ? estilos.pulsado : null,
        inactivo ? estilos.inactivo : null,
        style,
      ]}
    >
      {cargando ? (
        <ActivityIndicator color={variante === 'primario' ? colores.sobreFuego : colores.fuego} />
      ) : (
        <View style={estilos.contenido}>
          <Texto
            variante="boton"
            color={variante === 'primario' ? 'sobreFuego' : 'texto'}
            style={textos.boton}
          >
            {children}
          </Texto>
        </View>
      )}
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  base: {
    minHeight: TOQUE_MINIMO,
    paddingHorizontal: espacio.xl,
    borderRadius: radio.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  ancho: { alignSelf: 'stretch' },
  contenido: { flexDirection: 'row', alignItems: 'center', gap: espacio.sm },
  primario: { backgroundColor: colores.fuego },
  secundario: { backgroundColor: colores.superficie, borderColor: colores.borde },
  fantasma: { backgroundColor: 'transparent' },
  pulsado: { opacity: 0.82 },
  inactivo: { opacity: 0.4 },
});
