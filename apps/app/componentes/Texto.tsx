import { Text, type TextProps } from 'react-native';

import { colores, textos, type Color, type EstiloDeTexto } from '../theme/tokens.ts';

type Props = TextProps & {
  /** Uno de los estilos definidos en el sistema. No hay tamaños sueltos. */
  variante?: EstiloDeTexto;
  color?: Color;
  /**
   * Alinea las cifras en columna aunque la familia no sea monoespaciada. Para
   * las variantes `cifra` no hace falta: ya lo son.
   */
  tabular?: boolean;
};

export function Texto({ variante = 'cuerpo', color = 'texto', tabular, style, ...resto }: Props) {
  return (
    <Text
      style={[
        textos[variante],
        { color: colores[color] },
        tabular ? { fontVariant: ['tabular-nums'] } : null,
        style,
      ]}
      {...resto}
    />
  );
}
