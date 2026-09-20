import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Boton, Texto } from '../../componentes/index.ts';
import { guardarPaso } from '../../datos/perfil.ts';
import { colores, espacio } from '../../theme/tokens.ts';

/** Paso 1 de 16. */
export default function Bienvenida() {
  const router = useRouter();
  const [aviso, setAviso] = useState<string | null>(null);
  const [yendo, setYendo] = useState(false);

  async function comenzar() {
    setYendo(true);
    await guardarPaso(1);
    router.push('/onboarding/objetivos');
  }

  return (
    <SafeAreaView style={estilos.pantalla}>
      <View style={estilos.contenido}>
        <View style={estilos.marca}>
          <Texto variante="marca" color="fuego">
            Ablaze
          </Texto>
          <Texto variante="cuerpo" color="gris">
            Tu constancia enciende tu mejor versión.
          </Texto>
          <Texto variante="encabezado">Entrena, nutre, progresa.</Texto>
        </View>

        <View style={estilos.acciones}>
          <Boton onPress={comenzar} cargando={yendo}>
            Comenzar
          </Boton>

          <Boton
            variante="fantasma"
            onPress={() =>
              setAviso(
                'Todavía no hay cuentas. La aplicación funciona entera sin registrarse y guarda todo en este dispositivo; las cuentas llegan con la sincronización.',
              )
            }
          >
            Ya tengo cuenta
          </Boton>

          {aviso ? (
            <Texto variante="cuerpoMenor" color="gris">
              {aviso}
            </Texto>
          ) : null}
        </View>
      </View>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colores.oscuro },
  contenido: { flex: 1, justifyContent: 'space-between', padding: espacio.xl },
  marca: { flex: 1, justifyContent: 'center', gap: espacio.sm },
  acciones: { gap: espacio.sm },
});
