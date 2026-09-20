import { OBJETIVOS, type Objetivo } from '@ablaze/db';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Boton, Cabecera, Opcion, Texto } from '../../componentes/index.ts';
import { TOTAL_DE_PASOS } from '../../datos/pasos.ts';
import { guardarPaso, leerPerfil } from '../../datos/perfil.ts';
import { colores, espacio } from '../../theme/tokens.ts';

/** Paso 2 de 16. Selección múltiple. */
export default function Objetivos() {
  const router = useRouter();
  const [elegidos, setElegidos] = useState<Objetivo[]>([]);
  const [listo, setListo] = useState(false);
  const [guardando, setGuardando] = useState(false);

  // Se relee lo guardado al entrar: volver atrás a corregir tiene que mostrar lo
  // que ya se había elegido, no una pantalla en blanco.
  useEffect(() => {
    let vivo = true;
    leerPerfil()
      .then((perfil) => {
        if (!vivo) return;
        setElegidos(perfil?.objetivos ?? []);
        setListo(true);
      })
      .catch(() => {
        if (vivo) setListo(true);
      });
    return () => {
      vivo = false;
    };
  }, []);

  function alternar(objetivo: Objetivo) {
    setElegidos((previos) =>
      previos.includes(objetivo)
        ? previos.filter((o) => o !== objetivo)
        : [...previos, objetivo],
    );
  }

  async function siguiente() {
    setGuardando(true);
    await guardarPaso(2, { objetivos: elegidos });
    router.push('/onboarding/compromiso');
  }

  return (
    <SafeAreaView style={estilos.pantalla}>
      <ScrollView contentContainerStyle={estilos.contenido}>
        <Cabecera
          titulo="¿Qué quieres conseguir?"
          subtitulo="Puedes seleccionar más de una opción."
          paso={2}
          de={TOTAL_DE_PASOS}
        />

        <View style={estilos.lista}>
          {OBJETIVOS.map((objetivo) => (
            <Opcion
              key={objetivo}
              etiqueta={ETIQUETAS[objetivo]}
              seleccionada={elegidos.includes(objetivo)}
              onPress={() => alternar(objetivo)}
            />
          ))}
        </View>
      </ScrollView>

      <View style={estilos.pie}>
        {elegidos.length === 0 && listo ? (
          <Texto variante="cuerpoMenor" color="gris">
            Elige al menos uno. De aquí sale el plan que te propone la aplicación.
          </Texto>
        ) : null}
        <Boton onPress={siguiente} deshabilitado={elegidos.length === 0} cargando={guardando}>
          Siguiente
        </Boton>
      </View>
    </SafeAreaView>
  );
}

const ETIQUETAS: Record<Objetivo, string> = {
  perder_grasa: 'Perder grasa',
  ganar_musculo: 'Ganar músculo',
  marcar_abdomen: 'Marcar abdomen',
  ser_mas_fuerte: 'Ser más fuerte',
  mejorar_condicion: 'Mejorar mi condición física',
  preparar_deporte: 'Prepararme para un deporte',
  mantenerme_saludable: 'Mantenerme saludable',
};

const estilos = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colores.oscuro },
  contenido: { padding: espacio.xl, paddingBottom: espacio.lg },
  lista: { gap: espacio.sm },
  // El botón vive abajo y fijo: se toca con el pulgar, no se persigue al final
  // de una lista que hay que desplazar.
  pie: { padding: espacio.xl, paddingTop: espacio.md, gap: espacio.sm },
});
