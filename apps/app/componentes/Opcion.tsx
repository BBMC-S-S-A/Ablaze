import { Pressable, StyleSheet, View } from 'react-native';
import type { ReactNode } from 'react';

import { TOQUE_MINIMO, colores, espacio, radio } from '../theme/tokens.ts';
import { Texto } from './Texto.tsx';

type Props = {
  etiqueta: string;
  descripcion?: string;
  seleccionada: boolean;
  onPress: () => void;
  /**
   * `multiple` dibuja un cuadrado, `unica` un círculo. No es adorno: le dice al
   * usuario si puede elegir varias antes de tocar, que es justo lo que el
   * onboarding alterna pantalla a pantalla.
   */
  modo?: 'multiple' | 'unica';
  /** Un ícono o cualquier cosa a la izquierda. */
  adorno?: ReactNode;
};

export function Opcion({
  etiqueta,
  descripcion,
  seleccionada,
  onPress,
  modo = 'multiple',
  adorno,
}: Props) {
  return (
    <Pressable
      accessibilityRole={modo === 'multiple' ? 'checkbox' : 'radio'}
      // Las dos formas a propósito: en nativo manda `accessibilityState`, y en
      // web react-native-web no lo traduce a `aria-checked`, con lo que un lector
      // de pantalla lee las siete opciones sin decir cuáles están marcadas.
      accessibilityState={{ checked: seleccionada }}
      aria-checked={seleccionada}
      onPress={onPress}
      style={({ pressed }) => [
        estilos.fila,
        seleccionada ? estilos.seleccionada : null,
        pressed ? estilos.pulsada : null,
      ]}
    >
      {adorno ? <View style={estilos.adorno}>{adorno}</View> : null}

      <View style={estilos.centro}>
        <Texto variante="interfaz">{etiqueta}</Texto>
        {descripcion ? (
          <Texto variante="cuerpoMenor" color="gris">
            {descripcion}
          </Texto>
        ) : null}
      </View>

      <View
        style={[
          estilos.marca,
          modo === 'unica' ? estilos.marcaRedonda : null,
          seleccionada ? estilos.marcaActiva : null,
        ]}
      >
        {seleccionada ? (
          <View style={modo === 'unica' ? estilos.punto : estilos.palomita} />
        ) : null}
      </View>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  fila: {
    minHeight: TOQUE_MINIMO + 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacio.md,
    paddingHorizontal: espacio.lg,
    paddingVertical: espacio.md,
    borderRadius: radio.md,
    backgroundColor: colores.superficie,
    borderWidth: 1,
    borderColor: colores.borde,
  },
  seleccionada: { borderColor: colores.fuego },
  pulsada: { backgroundColor: colores.superficieAlta },
  adorno: { width: 24, alignItems: 'center' },
  centro: { flex: 1, gap: 2 },
  marca: {
    width: 22,
    height: 22,
    borderRadius: radio.sm / 1.6,
    borderWidth: 1.5,
    borderColor: colores.borde,
    alignItems: 'center',
    justifyContent: 'center',
  },
  marcaRedonda: { borderRadius: radio.redondo },
  marcaActiva: { backgroundColor: colores.fuego, borderColor: colores.fuego },
  palomita: {
    width: 10,
    height: 6,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderColor: colores.sobreFuego,
    transform: [{ rotate: '-45deg' }],
    marginTop: -2,
  },
  punto: {
    width: 8,
    height: 8,
    borderRadius: radio.redondo,
    backgroundColor: colores.sobreFuego,
  },
});
