import { exercises } from '@ablaze/db/sqlite';
import { count } from 'drizzle-orm';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { abrirBaseLocal, type BaseLocal } from '../basededatos/index.ts';
import { USUARIO_LOCAL_ID } from '../basededatos/sembrar.ts';
import { descargar, elegirArchivo } from '../datos/archivo';
import { exportar, importar, nombreDelArchivo } from '../datos/respaldo.ts';
import { Boton, Cabecera, Tarjeta, Texto } from '../componentes/index.ts';
import { colores, espacio } from '../theme/tokens.ts';

/**
 * Estado de la base local.
 *
 * No es una pantalla de desarrollo que se borra luego: en una PWA el
 * almacenamiento se puede desalojar, y el usuario necesita un sitio donde ver si
 * sus datos están a salvo y cuántos hay. Acabará dentro de ajustes.
 */
export default function Diagnostico() {
  const [base, setBase] = useState<BaseLocal | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ejercicios, setEjercicios] = useState<number | null>(null);
  const [trabajando, setTrabajando] = useState(false);
  const [respaldo, setRespaldo] = useState<string | null>(null);

  useEffect(() => {
    let vivo = true;
    abrirBaseLocal()
      .then(async (abierta) => {
        if (!vivo) return;
        setBase(abierta);
        await contar(abierta);
      })
      .catch((e: unknown) => {
        if (vivo) setError(e instanceof Error ? e.message : String(e));
      });
    return () => {
      vivo = false;
    };
  }, []);

  async function contar(abierta: BaseLocal) {
    const [fila] = await abierta.db.select({ total: count() }).from(exercises);
    setEjercicios(fila?.total ?? 0);
  }

  async function insertarDePrueba() {
    if (!base) return;
    setTrabajando(true);
    try {
      await base.db.insert(exercises).values({
        id: crypto.randomUUID(),
        // Con dueño: así no se confunde con el catálogo, que va sin userId.
        userId: USUARIO_LOCAL_ID,
        nombre: `Ejercicio de prueba ${new Date().toLocaleTimeString('es-CO')}`,
        musculoPrincipal: 'pecho',
        musculosSecundarios: ['triceps', 'hombros'],
        equipamiento: 'barra',
      });
      await contar(base);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setTrabajando(false);
    }
  }

  async function exportarTodo() {
    setTrabajando(true);
    try {
      const datos = await exportar();
      descargar(nombreDelArchivo(), JSON.stringify(datos, null, 2));
      const total = Object.values(datos.filas).reduce((a, b) => a + b, 0);
      setRespaldo(`Exportadas ${total} filas de ${Object.keys(datos.tablas).length} tablas.`);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setTrabajando(false);
    }
  }

  async function restaurar() {
    const contenido = await elegirArchivo();
    if (!contenido) return;
    setTrabajando(true);
    try {
      const resultado = await importar(contenido);
      setRespaldo(
        resultado.total === 0
          ? `No entró ninguna fila: las ${resultado.yaEstaban} del archivo ya estaban.`
          : `Restauradas ${resultado.total} filas (${resultado.yaEstaban} ya estaban). Recarga para verlas.`,
      );
      if (base) await contar(base);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setTrabajando(false);
    }
  }

  if (error) {
    return (
      <SafeAreaView style={estilos.pantalla}>
        <View style={estilos.contenido}>
          <Cabecera titulo="La base local no abrió" />
          <Tarjeta>
            <Texto variante="cuerpoMenor" color="fuego">
              {error}
            </Texto>
          </Tarjeta>
        </View>
      </SafeAreaView>
    );
  }

  if (!base) {
    return (
      <SafeAreaView style={estilos.pantalla}>
        <View style={estilos.contenido}>
          <Texto color="gris">Abriendo la base local…</Texto>
        </View>
      </SafeAreaView>
    );
  }

  const { motor, almacenamiento, migracion, sembrado } = base;

  return (
    <SafeAreaView style={estilos.pantalla}>
      <ScrollView contentContainerStyle={estilos.contenido}>
        <Cabecera titulo="Base local" subtitulo="Dónde viven tus datos y si están a salvo." />

        {!motor.persistente ? (
          <Tarjeta style={estilos.aviso}>
            <Texto variante="encabezado" color="fuego">
              Tus datos no se están guardando
            </Texto>
            <Texto variante="cuerpoMenor" color="gris">
              Esta sesión corre en memoria: al cerrar la pestaña se pierde todo. Suele
              pasar en navegación privada o en un navegador sin OPFS.
            </Texto>
            {motor.motivo ? (
              <Texto variante="cuerpoMenor" color="textoTenue">
                {motor.motivo}
              </Texto>
            ) : null}
          </Tarjeta>
        ) : null}

        <Tarjeta>
          <Dato etiqueta="Almacenamiento" valor={motor.almacenamiento} />
          <Dato etiqueta="Sobrevive al cierre" valor={motor.persistente ? 'sí' : 'no'} />
          <Dato
            etiqueta="Persistencia concedida"
            valor={
              !almacenamiento.soportado
                ? 'no soportada'
                : almacenamiento.persistido
                  ? 'sí'
                  : 'no (instálala en la pantalla de inicio)'
            }
          />
          {almacenamiento.usados !== undefined ? (
            <Dato etiqueta="Usado" valor={`${(almacenamiento.usados / 1024 / 1024).toFixed(1)} MB`} />
          ) : null}
        </Tarjeta>

        <Tarjeta>
          <Texto variante="etiqueta" color="gris">
            MIGRACIONES
          </Texto>
          <Dato
            etiqueta="Aplicadas ahora"
            valor={migracion.aplicadas.length > 0 ? migracion.aplicadas.join(', ') : 'ninguna'}
          />
          <Dato
            etiqueta="Ya estaban"
            valor={migracion.yaEstaban.length > 0 ? migracion.yaEstaban.join(', ') : 'ninguna'}
          />
        </Tarjeta>

        <Tarjeta>
          <Texto variante="etiqueta" color="gris">
            CATÁLOGO
          </Texto>
          <Dato etiqueta="Insertados ahora" valor={String(sembrado.ejerciciosInsertados)} />
          <Dato etiqueta="Ya estaban" valor={String(sembrado.ejerciciosQueYaEstaban)} />
        </Tarjeta>

        <Tarjeta>
          <Texto variante="etiqueta" color="gris">
            PRUEBA DE ESCRITURA
          </Texto>
          <Texto variante="cifraGrande">{ejercicios ?? '—'}</Texto>
          <Texto variante="cuerpoMenor" color="gris">
            filas en exercises. Inserta una, recarga la página y comprueba que el
            número no vuelve a cero: eso es lo que significa que persiste.
          </Texto>
        </Tarjeta>

        <Tarjeta>
          <Texto variante="etiqueta" color="gris">
            RESPALDO
          </Texto>
          <Texto variante="cuerpoMenor" color="gris">
            Safari puede desalojar el almacenamiento de un sitio que no se usa y tú
            no puedes impedirlo. Esto es la copia de mano: un archivo que puedes
            abrir y leer.
          </Texto>
          {respaldo ? (
            <Texto variante="cuerpoMenor" color="fuego">
              {respaldo}
            </Texto>
          ) : null}
          <Boton onPress={exportarTodo} cargando={trabajando}>
            Exportar todo a un archivo
          </Boton>
          <Boton variante="secundario" onPress={restaurar}>
            Restaurar desde un archivo
          </Boton>
        </Tarjeta>

        <Boton variante="fantasma" onPress={insertarDePrueba} cargando={trabajando}>
          Insertar una fila de prueba
        </Boton>
      </ScrollView>
    </SafeAreaView>
  );
}

function Dato({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <View style={estilos.dato}>
      <Texto variante="cuerpoMenor" color="gris">
        {etiqueta}
      </Texto>
      <Texto variante="cifra">{valor}</Texto>
    </View>
  );
}

const estilos = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colores.oscuro },
  contenido: { padding: espacio.xl, paddingBottom: espacio.xxxl, gap: espacio.lg },
  aviso: { borderColor: colores.fuego },
  dato: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: espacio.lg,
    flexWrap: 'wrap',
  },
});
