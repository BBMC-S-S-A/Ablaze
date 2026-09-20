import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Texto } from '../componentes/index.ts';
import { rutaParaReanudar } from '../datos/pasos.ts';
import { asegurarPerfil } from '../datos/perfil.ts';
import { colores, espacio } from '../theme/tokens.ts';

/**
 * Decide dónde entra la aplicación.
 *
 * Si el onboarding no está terminado, manda al paso donde se quedó. Si lo está,
 * al inicio. Nunca a la bienvenida de nuevo: nadie quiere volver a ver la
 * pantalla de bienvenida de una app que ya usa.
 */
export default function Entrada() {
  const [destino, setDestino] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let vivo = true;
    asegurarPerfil()
      .then((perfil) => {
        if (!vivo) return;
        setDestino(
          perfil.onboardingCompletadoEn ? '/ejercicios' : rutaParaReanudar(perfil.onboardingPaso),
        );
      })
      .catch((e: unknown) => {
        if (vivo) setError(e instanceof Error ? e.message : String(e));
      });
    return () => {
      vivo = false;
    };
  }, []);

  if (error) {
    return (
      <View style={estilos.centro}>
        <Texto variante="encabezado" color="fuego">
          No se pudo abrir la base local
        </Texto>
        <Texto variante="cuerpoMenor" color="gris">
          {error}
        </Texto>
      </View>
    );
  }

  // Fondo liso mientras se lee el perfil. Es cuestión de milisegundos y poner un
  // indicador de carga aquí hace que el arranque parezca más lento de lo que es.
  if (!destino) return <View style={estilos.centro} />;

  return <Redirect href={destino as never} />;
}

const estilos = StyleSheet.create({
  centro: {
    flex: 1,
    backgroundColor: colores.oscuro,
    alignItems: 'center',
    justifyContent: 'center',
    padding: espacio.xl,
    gap: espacio.sm,
  },
});
