import { MUSCULOS, OBJETIVOS, type Objetivo } from '@ablaze/db';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Boton, Cabecera, Campo, Opcion, Tarjeta, Texto } from '../componentes/index.ts';
import { colores, espacio } from '../theme/tokens.ts';

/**
 * Muestrario del sistema de diseño. Es temporal: esta ruta la ocupa la pantalla
 * de bienvenida del onboarding cuando se construya. Mientras tanto sirve para
 * ver los componentes en el teléfono real, que es donde se nota si un objetivo
 * de toque es demasiado pequeño.
 */
export default function Muestrario() {
  const [objetivos, setObjetivos] = useState<string[]>(['perder_grasa']);
  const [compromiso, setCompromiso] = useState('comprometerme');
  const [peso, setPeso] = useState('72');

  function alternarObjetivo(valor: string) {
    setObjetivos((previos) =>
      previos.includes(valor) ? previos.filter((v) => v !== valor) : [...previos, valor],
    );
  }

  return (
    <SafeAreaView style={estilos.pantalla}>
      <ScrollView contentContainerStyle={estilos.contenido}>
        <Texto variante="marca" color="fuego">
          Ablaze
        </Texto>
        <Texto variante="cuerpo" color="gris">
          Entrena, nutre, progresa.
        </Texto>

        <View style={estilos.seccion}>
          <Cabecera
            titulo="¿Qué quieres conseguir?"
            subtitulo="Puedes seleccionar más de una opción."
            paso={2}
            de={16}
          />
          <View style={estilos.lista}>
            {OBJETIVOS.slice(0, 4).map((objetivo) => (
              <Opcion
                key={objetivo}
                etiqueta={etiquetaDeObjetivo[objetivo]}
                seleccionada={objetivos.includes(objetivo)}
                onPress={() => alternarObjetivo(objetivo)}
              />
            ))}
          </View>
        </View>

        <View style={estilos.seccion}>
          <Texto variante="etiqueta" color="gris">
            SELECCIÓN ÚNICA
          </Texto>
          <View style={estilos.lista}>
            <Opcion
              modo="unica"
              etiqueta="Solo quiero intentarlo"
              seleccionada={compromiso === 'intentarlo'}
              onPress={() => setCompromiso('intentarlo')}
            />
            <Opcion
              modo="unica"
              etiqueta="Quiero comprometerme de verdad"
              descripcion="La llama sube por semana cumplida, no por día asistido."
              seleccionada={compromiso === 'comprometerme'}
              onPress={() => setCompromiso('comprometerme')}
            />
          </View>
        </View>

        <View style={estilos.seccion}>
          <Texto variante="etiqueta" color="gris">
            CAMPOS Y CIFRAS
          </Texto>
          <Campo etiqueta="Peso" value={peso} onChangeText={setPeso} sufijo="kg" numerico keyboardType="numeric" />
          <Tarjeta>
            <Texto variante="cuerpoMenor" color="gris">
              Press inclinado con barra
            </Texto>
            <Texto variante="cifraGrande">72,5</Texto>
            <Texto variante="cifra" color="gris">
              4 × 8 · 60 kg
            </Texto>
            <Texto variante="cifra" color="amarillo">
              120 kg · récord
            </Texto>
            <Texto variante="cuerpoMenor" color="textoTenue">
              El amarillo es el color más raro de ver en la aplicación. Si aparece
              con frecuencia, deja de significar un récord.
            </Texto>
          </Tarjeta>
        </View>

        <View style={estilos.seccion}>
          <Texto variante="etiqueta" color="gris">
            DOMINIO COMPARTIDO DESDE @ablaze/db
          </Texto>
          <Tarjeta>
            <Texto variante="cifraGrande">{MUSCULOS.length}</Texto>
            <Texto variante="cuerpoMenor" color="gris">
              grupos musculares · {OBJETIVOS.length} objetivos de onboarding
            </Texto>
          </Tarjeta>
        </View>

        <View style={estilos.botones}>
          <Boton onPress={() => {}}>Siguiente</Boton>
          <Boton variante="secundario" onPress={() => {}}>
            Más adelante
          </Boton>
          <Boton variante="fantasma" onPress={() => {}}>
            Ya tengo cuenta
          </Boton>
          <Boton deshabilitado>Sin objetivos seleccionados</Boton>
          <Boton cargando>Analizando tu perfil</Boton>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/**
 * Cómo se lee cada objetivo en pantalla. Tipado contra el dominio: si mañana se
 * añade un objetivo en @ablaze/db y aquí falta su texto, no compila.
 */
const etiquetaDeObjetivo: Record<Objetivo, string> = {
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
  contenido: { padding: espacio.xl, paddingBottom: espacio.xxxl, gap: espacio.xs },
  seccion: { marginTop: espacio.xxl, gap: espacio.sm },
  lista: { gap: espacio.sm },
  botones: { marginTop: espacio.xxl, gap: espacio.md },
});
