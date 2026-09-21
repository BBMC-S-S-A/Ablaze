# Ablaze

Registro de entrenamiento que conoce tu semana y tu gimnasio, y que representa la
constancia como una llama que crece.

Referencia del proyecto: `Ablaze — Propuesta de Producto` (PD-2026-01).
El tablero vive en DevUP, organización Hytrex, espacio Ablaze.

## Cómo está partido

```
apps/app      Expo Router. Se publica como PWA; compila a nativo sin reescribir.
apps/api      Node + Express. Copia de respaldo y sincronización. No es la fuente de verdad.
packages/db   Esquema Drizzle y dominio compartido por los dos lados.
```

## Arrancar

```sh
npm install
npm run app:web   # la app en http://localhost:8081
npm run api       # la API en http://localhost:3000
```

La API arranca sin base de datos: `GET /health` reporta `sin configurar` en vez de
fallar. Para conectarla, copiar `apps/api/.env.example` a `apps/api/.env`.

```sh
npm run db:generate   # migraciones de Postgres y de SQLite
npm run typecheck     # los tres paquetes
```

## Decisiones que conviene conocer antes de tocar nada

**El dispositivo manda, la nube copia.** La base local es la fuente de verdad.
Registrar una serie no puede depender de una petición de red: los sótanos de los
gimnasios no tienen señal.

**Es una PWA, no una app nativa.** No se paga la cuenta de Apple Developer, así que
se instala desde Safari con «Añadir a pantalla de inicio». Consecuencias: no hay
widgets ni HealthKit (imposibles en web, no difíciles), el temporizador de descanso
pierde la Live Activity, y la base local vive en OPFS, que Safari puede desalojar —
por eso la sincronización con el servidor es parte del MVP y no un lujo posterior.
Se mantiene Expo Router justamente para poder compilar a nativo el día que eso cambie.

**El dominio es `ablaze.hytrex.co` y no se cambia nunca.** OPFS está atado al
origen: mudar de dominio borra la base local de quien ya tenga la aplicación
instalada, sin aviso y sin vuelta atrás. Cualquier otra cosa del proyecto se
puede rehacer; esto no.

**El esquema se escribe dos veces, a propósito.** Drizzle no genera Postgres y SQLite
desde una sola definición. `schema.pg.ts` y `schema.sqlite.ts` deben quedar
equivalentes columna por columna; lo que sí se comparte son los valores y tipos del
dominio, en `domain.ts`.

**Todo lo que ocupa tiempo es un bloque.** Una clase, un turno de trabajo y una sesión
de pierna son el mismo tipo de registro. Así el calendario es una consulta sobre datos
que ya existen y no un segundo producto.

**Toda fila lleva dueño y visibilidad desde el primer día**, aunque hoy el único
usuario sea uno. Es la condición para compartir la app sin reescribirla.

**Sin modelo de lenguaje.** Las sugerencias salen de un motor de reglas determinista y
explicable. Para la entrada por voz, transcripción autoalojada más un intérprete de
dominio con gramática. Nada sale hacia un tercero.

## Principios de producto que mandan sobre el código

1. La aplicación nunca regaña. Fallar no se castiga, se replanifica.
2. Lo medido mueve el modelo; lo estimado solo pinta una capa encima, rotulada.
3. Tres círculos de visibilidad: uno mismo, los parceros, los desconocidos. Un horario
   detallado dice cuándo alguien no está en su casa, así que no se comparte.
4. El teléfono manda, la nube copia.
5. Sin signos de exclamación. Los números hablan solos.
