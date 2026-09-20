# @ablaze/db

El esquema y el dominio compartidos entre la app y la API.

```sh
npm run db:check      # los dos dialectos siguen siendo equivalentes
npm run db:generate   # migraciones de Postgres y de SQLite
```

## Por qué el esquema está escrito dos veces

Drizzle no genera Postgres y SQLite desde una sola definición de tabla. Así que
`schema.pg.ts` y `schema.sqlite.ts` son dos archivos que describen la misma base,
y `domain.ts` tiene lo único que sí se comparte: los valores permitidos y los
tipos.

Eso abre un riesgo evidente: que se separen sin que nadie se entere. Una columna
añadida en el servidor y olvidada en el dispositivo no rompe nada hoy, rompe la
sincronización dentro de tres meses, lejos del commit que la causó. Para eso está
`npm run db:check`, que compara nombres de tabla, nombres de columna, nulabilidad
y claves primarias, y falla si algo no cuadra. **Correrlo después de tocar
cualquiera de los dos archivos.**

No compara tipos, porque los tipos son distintos a propósito.

## Diferencias obligadas en SQLite

No son decisiones de estilo, son límites del motor:

| Postgres | SQLite | Por qué |
|---|---|---|
| `uuid` | `text` | SQLite no tiene uuid nativo |
| `timestamp with time zone` | `integer` en milisegundos | no hay tipo fecha |
| `date` | `text` con formato AAAA-MM-DD | igual, y así las dos columnas se leen igual |
| `text[]` | `text` en modo JSON | no hay columnas de arreglo |
| `jsonb` | `text` en modo JSON | no hay jsonb |
| `boolean` | `integer` en modo boolean | no hay booleano |

Y una que muerde: **SQLite ignora las claves foráneas salvo que se active
`PRAGMA foreign_keys = ON` en cada conexión.** No viene por defecto. Si no se
activa, los `ON DELETE CASCADE` del esquema son decorativos.

## Índices de claves foráneas: cuáles hay y cuáles no

Postgres crea un índice para la clave primaria, pero **no** para las columnas que
apuntan a otra tabla. Sin él, cada borrado en la tabla padre escanea entera la
hija para ver quién la referencia.

De las 33 claves foráneas hay 22 indexadas. Las otras 11 están sin índice **a
propósito**, porque cada índice cuesta escritura y `sets` es la tabla que más
crece. Están fuera porque solo se recorren al borrar un usuario, un gimnasio o un
ejercicio del catálogo, que son operaciones raras y sobre tablas pequeñas:

```
exercises.user_id            foods.user_id
gym_machines.exercise_id     gym_machines.creado_por
gyms.creado_por              photos.session_id
photos.measurement_id        routine_exercises.exercise_id
sessions.gym_id              time_blocks.gym_id
profiles.gym_principal_id
```

Ojo al contarlas: una columna declarada `UNIQUE` ya tiene su índice, aunque no
aparezca como `CREATE INDEX`. Es el caso de `profiles.user_id`.

Si alguna de esas tablas crece de verdad, o si borrar gimnasios deja de ser raro,
la decisión cambia. Hasta entonces, añadir esos índices es pagar sin recibir.

## Tablas que el documento de producto no lista

El documento enumera doce tablas y ninguna recoge lo que el onboarding pregunta
durante quince de sus dieciséis pantallas. Estas se añadieron por eso, y no están
en el documento:

| Tabla | Para qué |
|---|---|
| `routines`, `routine_exercises` | Sin ellas `sessions.routine_id` apuntaría a la nada |
| `profiles` | Objetivo, compromiso, hábitos de comida, cardio, suplementos, sueño, reloj y nivel de exigencia. Una fila por usuario |
| `injuries` | El mapa de molestias del paso 8 |
| `user_foods` | Los alimentos habituales del paso 12 |

En `profiles` casi todo es nulable a propósito: varias pantallas se pueden
saltar, y un perfil a medias tiene que ser un estado válido y no un error. Lleva
además `onboarding_paso`, que es lo que permite reanudar donde se dejó — son
dieciséis pantallas y nadie las termina de una sentada.

Las molestias **se apagan, no se borran** (`injuries.activa`): el historial de
lesiones es lo que explica una asimetría meses después.

## Migraciones

Son **append-only** desde la `0000`. Si hace falta cambiar algo, se añade una
migración nueva; no se edita ni se regenera una que ya esté en `main`, aunque
todavía no se haya aplicado en ningún sitio.

## Control de acceso

Aquí no hay RLS, y no es un olvido: las tablas no están expuestas por ninguna API
automática. El acceso lo controla `apps/api`, y eso convierte una regla del motor
en una disciplina del código: **toda consulta filtra por `user_id`**. Una consulta
que se olvide de hacerlo devuelve datos de otra persona y nada del motor lo va a
impedir.
