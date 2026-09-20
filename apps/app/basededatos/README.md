# La base local

Es la **fuente de verdad** de Ablaze. El servidor es una copia. Registrar una
serie escribe aquí y no depende de la red: los sótanos de los gimnasios no
tienen señal.

## Por qué SQLite vive en un worker

No es una decisión de rendimiento. Es la plataforma:
**`FileSystemFileHandle.createSyncAccessHandle` solo existe dentro de un worker
dedicado.** En el hilo principal está `undefined`, y comprobado en Chrome 152:

```
createSyncAccessHandle: "undefined"   ← hilo principal
```

Sin esa función, la VFS de OPFS no puede escribir y SQLite cae a memoria, que es
justo lo que no queremos. Así que el motor vive en `public/db-worker.mjs`.
Efecto secundario bueno: las consultas no bloquean la interfaz.

## Por qué el worker no pasa por Metro

Un worker necesita una URL a un script que el navegador pueda cargar solo, y
Metro no empaqueta workers para web. Como `@sqlite.org/sqlite-wasm` no tiene
imports estáticos, la salida es servir sus archivos tal cual:

```
public/db-worker.mjs   escrito a mano, se versiona
public/sqlite3.mjs     copiado de node_modules por `npm run wasm`
public/sqlite3.wasm    copiado de node_modules por `npm run wasm`
```

Los dos copiados **no se versionan**: se regeneran en cada arranque
(`prestart`/`preweb`) para que no puedan quedarse desfasados de la versión de la
librería, que es el fallo que produce errores incomprensibles en ejecución.

## Por qué `opfs-sahpool` y no la VFS `opfs`

La VFS `opfs` normal necesita `SharedArrayBuffer`, y eso obliga a servir la app
con cabeceras `Cross-Origin-Opener-Policy` y `Cross-Origin-Embedder-Policy`, que
además rompen la carga de recursos de otros orígenes. `opfs-sahpool` no las
necesita.

## Por qué no `expo-sqlite`

Sería un solo camino para web y nativo, y Drizzle tiene driver propio para él.
Pero su soporte web está **en alfa según su propia documentación** y exige esas
mismas cabeceras. No debajo de la fuente de verdad de la aplicación.

## El día que haya build nativa

`motor.ts` y `motor.web.ts` cumplen el mismo contrato (`motor.tipos.ts`) y Metro
elige por plataforma. Hoy `motor.ts` solo falla en voz alta. Cuando se pague la
cuenta de Apple, pasa a ser `expo-sqlite` con `drizzle-orm/expo-sqlite` y nada
por encima cambia.

**Ojo:** el import de `motor` en `index.ts` va **sin extensión**, y es el único
del proyecto que lo hace. Escribir `./motor.ts` resuelve ese archivo exacto y se
salta la elección por plataforma, con lo que la web se lleva el motor nativo.

## Migraciones

En el dispositivo no hay disco que leer, así que el SQL viaja dentro del bundle:
`packages/db/scripts/empaquetar-migraciones.ts` lo mete en un `.ts` y lo corre
`npm run db:generate`. `migrar.ts` aplica las que falten, cada una dentro de su
transacción, y anota cuáles en `_migraciones_aplicadas`.

## Lo que esto NO garantiza

Que los datos no se pierdan. Safari desaloja el almacenamiento de los sitios que
no se usan; instalar la PWA y `navigator.storage.persist()` lo mitigan y no lo
garantizan. Por eso hacen falta además la sincronización con el servidor y la
exportación a archivo. Cuando OPFS no está disponible, el motor sigue
funcionando en memoria y lo dice: la pantalla de diagnóstico avisa en rojo, y no
debe dejar de hacerlo.

## Comprobado

En Chrome 152, viewport de móvil, el 20 de septiembre de 2026:

- `almacenamiento: opfs`, las dos migraciones aplicadas en el primer arranque
- una fila insertada sobrevive a recargar la página, y el archivo pasa de 0,0 a
  0,5 MB de uso real
- en el segundo arranque las migraciones salen como «ya estaban»: no se reaplican
- una escritura genera **cero peticiones de red**
