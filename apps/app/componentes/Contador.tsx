import { Pressable, StyleSheet, View } from 'react-native';

import { TOQUE_MINIMO, colores, espacio, radio } from '../theme/tokens.ts';
import { Texto } from './Texto.tsx';

type Props = {
  etiqueta: string;
  valor: number;
  onChange: (valor: number) => void;
  paso?: number;
  minimo?: number;
  maximo?: number;
  sufijo?: string;
  /** Cuántos decimales enseñar. Los kilos van en medios, las repeticiones enteras. */
  decimales?: number;
};

/**
 * Sumar y restar con el pulgar.
 *
 * Los botones son grandes a propósito: esto se usa entre descansos, de pie y con
 * las manos sudadas, y un objetivo pequeño se falla. Por eso también son − y +
 * en vez de un campo de texto: abrir el teclado numérico para cambiar de 60 a
 * 62,5 kilos es más trabajo del que vale.
 */
export function Contador({
  etiqueta,
  valor,
  onChange,
  paso = 1,
  minimo = 0,
  maximo = 9999,
  sufijo,
  decimales = 0,
}: Props) {
  function mover(direccion: 1 | -1) {
    // Se redondea al paso: sumar 2,5 sobre 61 debe dar 62,5 o 63,5 según el
    // caso, no 63,5000000001 por la aritmética de coma flotante.
    const bruto = valor + direccion * paso;
    const ajustado = Math.round(bruto / paso) * paso;
    onChange(Math.min(maximo, Math.max(minimo, Number(ajustado.toFixed(decimales)))));
  }

  return (
    <View style={estilos.contenedor}>
      <Texto variante="cuerpoMenor" color="gris">
        {etiqueta}
      </Texto>

      <View style={estilos.fila}>
        <Boton signo="−" onPress={() => mover(-1)} deshabilitado={valor <= minimo} />

        <View style={estilos.valor}>
          <Texto variante="cifraGrande">{valor.toFixed(decimales).replace('.', ',')}</Texto>
          {sufijo ? (
            <Texto variante="cuerpoMenor" color="gris">
              {sufijo}
            </Texto>
          ) : null}
        </View>

        <Boton signo="+" onPress={() => mover(1)} deshabilitado={valor >= maximo} />
      </View>
    </View>
  );
}

function Boton({
  signo,
  onPress,
  deshabilitado,
}: {
  signo: string;
  onPress: () => void;
  deshabilitado: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={signo === '+' ? 'Aumentar' : 'Disminuir'}
      disabled={deshabilitado}
      onPress={onPress}
      style={({ pressed }) => [
        estilos.boton,
        pressed && !deshabilitado ? estilos.pulsado : null,
        deshabilitado ? estilos.inactivo : null,
      ]}
    >
      <Texto variante="titulo">{signo}</Texto>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  contenedor: { gap: espacio.xs, alignSelf: 'stretch' },
  fila: { flexDirection: 'row', alignItems: 'center', gap: espacio.md },
  boton: {
    width: TOQUE_MINIMO + 8,
    height: TOQUE_MINIMO + 8,
    borderRadius: radio.md,
    backgroundColor: colores.superficieAlta,
    borderWidth: 1,
    borderColor: colores.borde,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulsado: { backgroundColor: colores.borde },
  inactivo: { opacity: 0.35 },
  valor: { flex: 1, alignItems: 'center' },
});
