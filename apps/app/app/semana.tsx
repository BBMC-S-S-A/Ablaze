import type { TipoDeBloque } from '@ablaze/db';
import type { Ventana } from '@ablaze/reglas';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Cabecera, Chip, Tarjeta, Texto } from '../componentes/index.ts';
import {
  FRANJAS,
  HORAS_POR_FRANJA,
  bloquesDeLaSemana,
  borrarBloque,
  lunesDeLaSemana,
  pintarFranja,
  sesionesPlaneadas,
  ventanasDeLaSemana,
  type BloqueDeLaSemana,
} from '../datos/bloques.ts';
import { colores, espacio, radio } from '../theme/tokens.ts';

const DIAS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

/**
 * Tu semana.
 *
 * Responde la pregunta que ninguna otra aplicación responde: cuándo puedes
 * entrenar de verdad. Se pinta a franjas de dos horas, como el mockup, y de los
 * huecos que quedan salen las ventanas.
 *
 * Se pinta en vez de arrastrar. Arrastrar en una rejilla con el pulgar es de las
 * cosas más fáciles de hacer mal, y pintando se consigue lo mismo sin que se te
 * escape el dedo. Mover un bloque es repintarlo donde va.
 */
export default function Semana() {
  const [lunes] = useState(() => lunesDeLaSemana(new Date()));
  const [bloques, setBloques] = useState<BloqueDeLaSemana[]>([]);
  const [ventanas, setVentanas] = useState<Ventana[]>([]);
  const [pincel, setPincel] = useState<TipoDeBloque | 'borrar'>('clase');

  const cargar = useCallback(async () => {
    const [b, v] = await Promise.all([bloquesDeLaSemana(lunes), ventanasDeLaSemana(lunes, 60)]);
    setBloques(b);
    setVentanas(v);
  }, [lunes]);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  function bloqueEn(indiceDelDia: number, hora: number): BloqueDeLaSemana | undefined {
    return bloques.find(
      (b) => (b.inicio.getDay() + 6) % 7 === indiceDelDia && b.inicio.getHours() === hora,
    );
  }

  async function tocar(indiceDelDia: number, hora: number) {
    const existente = bloqueEn(indiceDelDia, hora);
    const dia = new Date(lunes);
    dia.setDate(dia.getDate() + indiceDelDia);

    if (existente) await borrarBloque(existente.id);
    if (!existente && pincel !== 'borrar') await pintarFranja(dia, hora, pincel);
    // Repintar con otro tipo: se borra el viejo y se pone el nuevo.
    if (existente && pincel !== 'borrar' && existente.tipo !== pincel) {
      await pintarFranja(dia, hora, pincel);
    }

    await cargar();
  }

  const planeadas = sesionesPlaneadas(bloques);

  return (
    <SafeAreaView style={estilos.pantalla}>
      <ScrollView contentContainerStyle={estilos.contenido}>
        <Cabecera
          titulo="Tu semana"
          subtitulo="Pinta lo que te ocupa. De los huecos salen las ventanas donde cabe entrenar."
        />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={estilos.pinceles}>
          {(['clase', 'trabajo', 'sesion', 'libre', 'borrar'] as const).map((t) => (
            <Chip
              key={t}
              etiqueta={ETIQUETAS[t]}
              activo={pincel === t}
              onPress={() => setPincel(t)}
            />
          ))}
        </ScrollView>

        <View style={estilos.rejilla}>
          <View style={estilos.columnaHoras}>
            <View style={estilos.celdaCabecera} />
            {FRANJAS.map((h) => (
              <View key={h} style={estilos.celdaHora}>
                <Texto variante="cuerpoMenor" color="textoTenue">
                  {h}
                </Texto>
              </View>
            ))}
          </View>

          {DIAS.map((dia, indice) => (
            <View key={dia} style={estilos.columna}>
              <View style={estilos.celdaCabecera}>
                <Texto variante="cuerpoMenor" color="gris">
                  {dia}
                </Texto>
              </View>
              {FRANJAS.map((hora) => {
                const bloque = bloqueEn(indice, hora);
                return (
                  <Pressable
                    key={hora}
                    accessibilityRole="button"
                    accessibilityLabel={`${dia} ${hora} a ${hora + HORAS_POR_FRANJA}${bloque ? `, ${ETIQUETAS[bloque.tipo]}` : ', libre'}`}
                    onPress={() => void tocar(indice, hora)}
                    style={({ pressed }) => [
                      estilos.celda,
                      bloque ? { backgroundColor: COLORES[bloque.tipo] } : null,
                      pressed ? estilos.celdaPulsada : null,
                    ]}
                  />
                );
              })}
            </View>
          ))}
        </View>

        <Tarjeta>
          <Texto variante="etiqueta" color="gris">
            VENTANAS DE ESTA SEMANA
          </Texto>
          {ventanas.length === 0 ? (
            <Texto variante="cuerpoMenor" color="textoTenue">
              No queda ningún hueco de al menos una hora. Si eso no cuadra con tu
              semana real, probablemente falte pintar algo o sobre algo pintado.
            </Texto>
          ) : (
            <>
              <Texto variante="cifraGrande">{ventanas.length}</Texto>
              <Texto variante="cuerpoMenor" color="gris">
                huecos de una hora o más. {planeadas > 0
                  ? `Tienes ${planeadas} ${planeadas === 1 ? 'sesión' : 'sesiones'} de gimnasio pintadas.`
                  : 'Todavía no has pintado ninguna sesión de gimnasio.'}
              </Texto>
              {ventanas.slice(0, 6).map((v) => (
                <Texto key={v.inicio.toISOString()} variante="cifra" color="gris">
                  {DIAS[(v.inicio.getDay() + 6) % 7]} {v.inicio.getHours()}:00–
                  {horaDeFin(v.fin)}:00 · {Math.floor(v.minutos / 60)} h
                </Texto>
              ))}
              {ventanas.length > 6 ? (
                <Texto variante="cuerpoMenor" color="textoTenue">
                  y {ventanas.length - 6} más.
                </Texto>
              ) : null}
            </>
          )}
        </Tarjeta>
      </ScrollView>
    </SafeAreaView>
  );
}

/** Medianoche se lee mejor como 24 que como 0 cuando cierra un día. */
function horaDeFin(fin: Date): number {
  return fin.getHours() === 0 ? 24 : fin.getHours();
}

const ETIQUETAS: Record<TipoDeBloque | 'borrar', string> = {
  clase: 'Clase',
  trabajo: 'Trabajo',
  sesion: 'Gimnasio',
  libre: 'Libre',
  otro: 'Otro',
  borrar: 'Borrar',
};

const COLORES: Record<TipoDeBloque, string> = {
  clase: '#3B4A6B',
  trabajo: '#4A3B6B',
  sesion: colores.fuego,
  libre: '#2A3A2A',
  otro: colores.borde,
};

const estilos = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colores.oscuro },
  contenido: { padding: espacio.xl, paddingBottom: espacio.xxxl, gap: espacio.md },
  pinceles: { gap: espacio.sm },
  rejilla: { flexDirection: 'row', gap: 2 },
  columnaHoras: { gap: 2 },
  columna: { flex: 1, gap: 2 },
  celdaCabecera: { height: 20, alignItems: 'center', justifyContent: 'center' },
  celdaHora: { height: 34, alignItems: 'center', justifyContent: 'center', width: 22 },
  celda: {
    height: 34,
    borderRadius: radio.sm / 2,
    backgroundColor: colores.superficie,
    borderWidth: 1,
    borderColor: colores.borde,
  },
  celdaPulsada: { opacity: 0.6 },
});
