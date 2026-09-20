import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';
import { useState } from 'react';

import { TOQUE_MINIMO, colores, espacio, radio, textos } from '../theme/tokens.ts';
import { Texto } from './Texto.tsx';

type Props = Omit<TextInputProps, 'style'> & {
  etiqueta?: string;
  /** Unidad o aclaración a la derecha: kg, cm, min. */
  sufijo?: string;
  error?: string;
  /** Alinea el valor como cifra monoespaciada. Para pesos, repeticiones y medidas. */
  numerico?: boolean;
};

export function Campo({ etiqueta, sufijo, error, numerico = false, ...resto }: Props) {
  const [enfocado, setEnfocado] = useState(false);

  return (
    <View style={estilos.contenedor}>
      {etiqueta ? (
        <Texto variante="cuerpoMenor" color="gris">
          {etiqueta}
        </Texto>
      ) : null}

      <View
        style={[
          estilos.caja,
          enfocado ? estilos.enfocada : null,
          error ? estilos.conError : null,
        ]}
      >
        <TextInput
          style={[estilos.entrada, numerico ? textos.cifra : textos.interfaz]}
          placeholderTextColor={colores.textoTenue}
          selectionColor={colores.fuego}
          onFocus={() => setEnfocado(true)}
          onBlur={() => setEnfocado(false)}
          {...resto}
        />
        {sufijo ? (
          <Texto variante="cuerpoMenor" color="gris">
            {sufijo}
          </Texto>
        ) : null}
      </View>

      {error ? (
        <Texto variante="cuerpoMenor" color="fuego">
          {error}
        </Texto>
      ) : null}
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: { gap: espacio.xs, alignSelf: 'stretch' },
  caja: {
    minHeight: TOQUE_MINIMO,
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacio.sm,
    paddingHorizontal: espacio.lg,
    borderRadius: radio.md,
    backgroundColor: colores.superficie,
    borderWidth: 1,
    borderColor: colores.borde,
  },
  enfocada: { borderColor: colores.bordeActivo },
  conError: { borderColor: colores.fuego },
  entrada: {
    flex: 1,
    color: colores.texto,
    // Sin esto, en web el input dibuja su propio contorno encima del nuestro.
    outlineStyle: 'none',
  } as never,
});
