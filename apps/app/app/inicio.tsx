import { DESBLOQUEOS, NIVELES, evaluar, type Resultado } from '@ablaze/reglas';
import type { Profile, Session } from '@ablaze/db/sqlite';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Boton, Tarjeta, Texto } from '../componentes/index.ts';
import { asistencia, construirContexto, type Asistencia } from '../datos/contexto.ts';
import { recalcularLlama, type LlamaConHistorial } from '../datos/llama.ts';
import { leerPerfil } from '../datos/perfil.ts';
import { sesionEnCurso } from '../datos/sesiones.ts';
import { colores, espacio, radio } from '../theme/tokens.ts';

/**
 * La pantalla de inicio.
 *
 * Regla que la gobierna: **ningún número está quemado.** Todo lo que se ve sale
 * de una consulta, y lo que todavía no se puede calcular no enseña un cero: dice
 * qué le falta. Un cero es una afirmación, y afirmar «0 kcal» cuando no existe
 * el registro de comidas es mentir con una cifra.
 */
export default function Inicio() {
  const router = useRouter();
  const [perfil, setPerfil] = useState<Profile | null>(null);
  const [datos, setDatos] = useState<Asistencia | null>(null);
  const [reglas, setReglas] = useState<Resultado | null>(null);
  const [abierta, setAbierta] = useState<Session | null>(null);
  const [llama, setLlama] = useState<LlamaConHistorial | null>(null);

  useEffect(() => {
    let vivo = true;
    Promise.all([leerPerfil(), asistencia(), construirContexto(), sesionEnCurso(), recalcularLlama()])
      .then(([p, a, contexto, s, l]) => {
        if (!vivo) return;
        setPerfil(p);
        setDatos(a);
        setReglas(evaluar(contexto));
        setAbierta(s);
        setLlama(l);
      })
      .catch(() => {});
    return () => {
      vivo = false;
    };
  }, []);

  return (
    <SafeAreaView style={estilos.pantalla}>
      <ScrollView contentContainerStyle={estilos.contenido}>
        <View>
          <Texto variante="marca" color="fuego">
            Ablaze
          </Texto>
          <Texto variante="cuerpo" color="gris">
            {perfil?.objetivos.length
              ? 'Tu constancia te está llevando lejos.'
              : 'Entrena, nutre, progresa.'}
          </Texto>
        </View>

        {abierta ? (
          <Tarjeta onPress={() => router.push('/sesion')}>
            <Texto variante="etiqueta" color="fuego">
              ENTRENAMIENTO ABIERTO
            </Texto>
            <Texto variante="interfaz">Tienes una sesión sin cerrar. Tocar para seguir.</Texto>
          </Tarjeta>
        ) : null}

        <Tarjeta>
          <Texto variante="etiqueta" color="gris">
            ASISTENCIA
          </Texto>
          <View style={estilos.cifras}>
            <Cifra valor={datos ? String(datos.diasEsteMes) : '—'} etiqueta="días este mes" />
            <Cifra valor={datos ? String(datos.diasEsteAno) : '—'} etiqueta="días este año" />
          </View>
          <Texto variante="cuerpoMenor" color="textoTenue">
            {datos?.ultimoEntrenamiento
              ? `El último fue el ${datos.ultimoEntrenamiento.toLocaleDateString('es-CO', { day: '2-digit', month: 'long' })}.`
              : 'Todavía no has cerrado ningún entrenamiento.'}
          </Texto>
        </Tarjeta>

        <Tarjeta>
          <Texto variante="etiqueta" color="gris">
            LA LLAMA
          </Texto>
          {llama ? (
            <>
              <Texto variante="titulo" color="fuego">
                {llama.nombre.charAt(0).toUpperCase() + llama.nombre.slice(1)}
              </Texto>
              <View style={estilos.carril}>
                <View
                  style={[
                    estilos.avance,
                    { width: `${Math.min(100, porcentajeDelNivel(llama))}%` },
                  ]}
                />
              </View>
              <Texto variante="cuerpoMenor" color="gris">
                {llama.semanasParaSubir === null
                  ? 'Estás en el nivel más alto.'
                  : llama.semanasParaSubir === 0
                    ? 'Con la semana de esta semana cumplida, subes.'
                    : `${llama.semanasParaSubir} ${llama.semanasParaSubir === 1 ? 'semana cumplida' : 'semanas cumplidas'} para ${NIVELES[llama.nivel] ?? 'el siguiente nivel'}.`}
              </Texto>
              <Texto variante="cuerpoMenor" color="textoTenue">
                {DESBLOQUEOS[llama.nombre]} Sube por semana cumplida contra lo que
                planeaste, no por día asistido, y el descanso planificado no la toca.
              </Texto>
            </>
          ) : (
            <Texto variante="cuerpoMenor" color="textoTenue">
              Calculando…
            </Texto>
          )}
        </Tarjeta>

        {reglas && reglas.sugerencias.length > 0 ? (
          <View style={estilos.grupo}>
            <Texto variante="etiqueta" color="gris">
              HOY
            </Texto>
            {reglas.sugerencias.map((s) => (
              <Tarjeta key={s.regla} style={s.prioridad === 'alta' ? estilos.alta : undefined}>
                <Texto variante="interfaz">{s.titulo}</Texto>
                {/* La razón va siempre, con los números detrás: una sugerencia
                    sin motivo es una orden. */}
                <Texto variante="cuerpoMenor" color="gris">
                  {s.razon}
                </Texto>
              </Tarjeta>
            ))}
          </View>
        ) : null}

        {reglas && reglas.faltantes.length > 0 ? (
          <Tarjeta>
            <Texto variante="etiqueta" color="gris">
              LO QUE TODAVÍA NO PUEDO DECIRTE
            </Texto>
            {reglas.faltantes.map((f) => (
              <Texto key={f.regla} variante="cuerpoMenor" color="textoTenue">
                · {f.falta}
              </Texto>
            ))}
          </Tarjeta>
        ) : null}

        <Tarjeta>
          <Texto variante="etiqueta" color="gris">
            NUTRICIÓN
          </Texto>
          <Texto variante="cuerpoMenor" color="textoTenue">
            El registro de comidas no está construido. Cuando lo esté, aquí van las
            calorías, la proteína y el agua del día; mientras tanto no hay cifras
            que enseñar.
          </Texto>
        </Tarjeta>

        <View style={estilos.acciones}>
          <Boton onPress={() => router.push('/ejercicios')}>
            {abierta ? 'Añadir un ejercicio' : 'Entrenar'}
          </Boton>
          <Boton variante="secundario" onPress={() => router.push('/semana')}>
            Tu semana
          </Boton>
          <Boton variante="secundario" onPress={() => router.push('/progreso')}>
            Ver mi progreso
          </Boton>
          <Boton variante="fantasma" onPress={() => router.push('/diagnostico')}>
            Estado de mis datos
          </Boton>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/** Cuánto se lleva recorrido dentro del nivel actual, de 0 a 100. */
function porcentajeDelNivel(llama: LlamaConHistorial): number {
  const umbrales = [0, 4, 8, 12, 26];
  const desde = umbrales[llama.nivel - 1] ?? 0;
  const hasta = umbrales[llama.nivel];
  if (hasta === undefined) return 100;
  return ((llama.progreso - desde) / (hasta - desde)) * 100;
}

function Cifra({ valor, etiqueta }: { valor: string; etiqueta: string }) {
  return (
    <View style={estilos.cifra}>
      <Texto variante="cifraGrande">{valor}</Texto>
      <Texto variante="cuerpoMenor" color="gris">
        {etiqueta}
      </Texto>
    </View>
  );
}

const estilos = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colores.oscuro },
  contenido: { padding: espacio.xl, paddingBottom: espacio.xxxl, gap: espacio.md },
  cifras: { flexDirection: 'row', gap: espacio.xxl },
  cifra: { gap: 2 },
  grupo: { gap: espacio.sm },
  alta: { borderColor: colores.fuego, borderRadius: radio.lg },
  acciones: { gap: espacio.sm, marginTop: espacio.lg },
  carril: { height: 6, borderRadius: 999, backgroundColor: colores.borde, overflow: 'hidden' },
  avance: { height: '100%', backgroundColor: colores.fuego },
});
