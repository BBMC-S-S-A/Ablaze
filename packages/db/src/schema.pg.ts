/**
 * Esquema de Postgres: la copia del servidor.
 *
 * El teléfono manda y la nube copia, así que esta base es un respaldo
 * sincronizado, no la fuente de verdad. Debe quedar equivalente a
 * schema.sqlite.ts columna por columna.
 */
import {
  boolean,
  date,
  index,
  integer,
  jsonb,
  pgTable,
  real,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

import {
  ANGULOS_DE_FOTO,
  COMIDAS,
  EQUIPAMIENTOS,
  ESTADOS_DE_AMISTAD,
  FUENTES_DE_ALIMENTO,
  LADOS,
  MUSCULOS,
  ORIGENES_DE_GRASA,
  REPETICIONES,
  TIPOS_DE_BLOQUE,
  TIPOS_DE_FOTO,
  VISIBILIDADES,
  type TablaDePlacas,
} from './domain.ts';

const creadoEn = timestamp('creado_en', { withTimezone: true }).notNull().defaultNow();
const actualizadoEn = timestamp('actualizado_en', { withTimezone: true }).notNull().defaultNow();

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  nombre: text('nombre').notNull(),
  creadoEn,
  actualizadoEn,
});

export const exercises = pgTable(
  'exercises',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    // Nulo cuando es un ejercicio del catálogo base; con dueño cuando el
    // usuario se lo inventó. No hay límite de ejercicios personalizados.
    userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
    nombre: text('nombre').notNull(),
    musculoPrincipal: text('musculo_principal', { enum: MUSCULOS }).notNull(),
    musculosSecundarios: text('musculos_secundarios', { enum: MUSCULOS }).array().notNull().default([]),
    equipamiento: text('equipamiento', { enum: EQUIPAMIENTOS }).notNull(),
    unilateral: boolean('unilateral').notNull().default(false),
    visibilidad: text('visibilidad', { enum: VISIBILIDADES }).notNull().default('privado'),
    version: integer('version').notNull().default(1),
    creadoEn,
    actualizadoEn,
  },
  (t) => [index('exercises_musculo_principal_idx').on(t.musculoPrincipal)],
);

/** Sedes. Catálogo compartido: el mapa de gimnasios reales es un activo que crece con el uso. */
export const gyms = pgTable(
  'gyms',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    creadoPor: uuid('creado_por').references(() => users.id, { onDelete: 'set null' }),
    nombre: text('nombre').notNull(),
    direccion: text('direccion'),
    ciudad: text('ciudad'),
    latitud: real('latitud'),
    longitud: real('longitud'),
    // Una sede cargada a mano por el equipo pesa más que una que puso cualquiera.
    verificado: boolean('verificado').notNull().default(false),
    visibilidad: text('visibilidad', { enum: VISIBILIDADES }).notNull().default('publico'),
    creadoEn,
    actualizadoEn,
  },
  (t) => [index('gyms_ciudad_idx').on(t.ciudad)],
);

/** El inventario físico de una sede. Habilita el peso real en placas y la sustitución de ejercicios. */
export const gymMachines = pgTable(
  'gym_machines',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    gymId: uuid('gym_id')
      .notNull()
      .references(() => gyms.id, { onDelete: 'cascade' }),
    exerciseId: uuid('exercise_id').references(() => exercises.id, { onDelete: 'set null' }),
    nombre: text('nombre').notNull(),
    marca: text('marca'),
    equipamiento: text('equipamiento', { enum: EQUIPAMIENTOS }).notNull(),
    // Número de placa a kilos reales. Nulo cuando la máquina marca kilos de frente.
    placaAKg: jsonb('placa_a_kg').$type<TablaDePlacas>(),
    pesoMinimoKg: real('peso_minimo_kg'),
    incrementoKg: real('incremento_kg'),
    cantidad: integer('cantidad').notNull().default(1),
    creadoPor: uuid('creado_por').references(() => users.id, { onDelete: 'set null' }),
    creadoEn,
    actualizadoEn,
  },
  (t) => [index('gym_machines_gym_idx').on(t.gymId)],
);

/**
 * Pieza central del modelo. Todo lo que ocupa tiempo vive aquí: una clase, un
 * turno y una sesión de pierna son el mismo registro. Los huecos entre bloques
 * son las ventanas donde cabe entrenar.
 */
export const timeBlocks = pgTable(
  'time_blocks',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    tipo: text('tipo', { enum: TIPOS_DE_BLOQUE }).notNull(),
    titulo: text('titulo'),
    inicio: timestamp('inicio', { withTimezone: true }).notNull(),
    fin: timestamp('fin', { withTimezone: true }).notNull(),
    repeticion: text('repeticion', { enum: REPETICIONES }).notNull().default('ninguna'),
    repeticionHasta: timestamp('repeticion_hasta', { withTimezone: true }),
    gymId: uuid('gym_id').references(() => gyms.id, { onDelete: 'set null' }),
    // Los parceros ven si estás libre u ocupado, nunca el horario detallado:
    // un horario dice cuándo alguien no está en su casa.
    visibilidad: text('visibilidad', { enum: VISIBILIDADES }).notNull().default('privado'),
    creadoEn,
    actualizadoEn,
  },
  (t) => [index('time_blocks_user_inicio_idx').on(t.userId, t.inicio)],
);

/** Una rutina: la plantilla desde la que se abre una sesión. */
export const routines = pgTable(
  'routines',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    nombre: text('nombre').notNull(),
    notas: text('notas'),
    // Cuando se copia una rutina de la comunidad, de dónde salió. Sin clave
    // foránea a propósito: la original puede desaparecer y la copia sigue
    // siendo válida.
    copiadaDe: uuid('copiada_de'),
    visibilidad: text('visibilidad', { enum: VISIBILIDADES }).notNull().default('privado'),
    creadoEn,
    actualizadoEn,
  },
  (t) => [index('routines_user_idx').on(t.userId)],
);

export const routineExercises = pgTable(
  'routine_exercises',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    routineId: uuid('routine_id')
      .notNull()
      .references(() => routines.id, { onDelete: 'cascade' }),
    exerciseId: uuid('exercise_id')
      .notNull()
      .references(() => exercises.id, { onDelete: 'cascade' }),
    orden: integer('orden').notNull(),
    seriesObjetivo: integer('series_objetivo'),
    repeticionesObjetivo: integer('repeticiones_objetivo'),
    descansoSegundos: integer('descanso_segundos'),
    creadoEn,
    actualizadoEn,
  },
  (t) => [index('routine_exercises_routine_idx').on(t.routineId, t.orden)],
);

/**
 * Un entrenamiento concreto. Está separada de time_blocks a propósito: se puede
 * entrenar sin haberlo planeado, y esa sesión debe poder existir sin bloque.
 */
export const sessions = pgTable(
  'sessions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    timeBlockId: uuid('time_block_id').references(() => timeBlocks.id, { onDelete: 'set null' }),
    routineId: uuid('routine_id').references(() => routines.id, { onDelete: 'set null' }),
    gymId: uuid('gym_id').references(() => gyms.id, { onDelete: 'set null' }),
    inicio: timestamp('inicio', { withTimezone: true }).notNull(),
    // Nulo mientras la sesión está en curso.
    fin: timestamp('fin', { withTimezone: true }),
    notas: text('notas'),
    visibilidad: text('visibilidad', { enum: VISIBILIDADES }).notNull().default('privado'),
    creadoEn,
    actualizadoEn,
  },
  (t) => [
    index('sessions_user_inicio_idx').on(t.userId, t.inicio),
    // Editar la semana borra y recrea bloques constantemente, y cada borrado
    // pone a null el bloque de las sesiones que lo apuntan. Sin este índice
    // eso escanea sessions entera cada vez.
    index('sessions_time_block_idx').on(t.timeBlockId),
    index('sessions_routine_idx').on(t.routineId),
  ],
);

/** Serie a serie. La tabla que más crece: toda la progresión sale de aquí. */
export const sets = pgTable(
  'sets',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    sessionId: uuid('session_id')
      .notNull()
      .references(() => sessions.id, { onDelete: 'cascade' }),
    exerciseId: uuid('exercise_id')
      .notNull()
      .references(() => exercises.id, { onDelete: 'restrict' }),
    // Con qué máquina concreta se hizo. Es lo que ata el peso a una sede real.
    gymMachineId: uuid('gym_machine_id').references(() => gymMachines.id, { onDelete: 'set null' }),
    orden: integer('orden').notNull(),
    repeticiones: integer('repeticiones').notNull(),
    pesoKg: real('peso_kg'),
    // Placa marcada en la máquina, cuando aplica. Se guarda además del peso en
    // kilos para poder recalcular si la tabla de la máquina se corrige después.
    placa: integer('placa'),
    // Esfuerzo percibido, de 1 a 10.
    esfuerzo: integer('esfuerzo'),
    lado: text('lado', { enum: LADOS }).notNull().default('ambos'),
    calentamiento: boolean('calentamiento').notNull().default(false),
    completadaEn: timestamp('completada_en', { withTimezone: true }).notNull().defaultNow(),
    creadoEn,
    actualizadoEn,
  },
  (t) => [
    index('sets_session_orden_idx').on(t.sessionId, t.orden),
    index('sets_user_exercise_idx').on(t.userId, t.exerciseId, t.completadaEn),
    // sets_user_exercise_idx no sirve para la clave foránea: exercise_id no es
    // su primera columna, así que la comprobación de RESTRICT al borrar un
    // ejercicio escanearía sets entera, que es la tabla que más crece.
    index('sets_exercise_idx').on(t.exerciseId),
    // Corregir la tabla de placas de una máquina es previsible, y cada borrado
    // pone a null esta columna en sets.
    index('sets_gym_machine_idx').on(t.gymMachineId),
  ],
);

/**
 * La llama, semana a semana. Nunca se guarda solo el número final: se guardan
 * las planeadas y las cumplidas para poder reconstruir el historial y
 * recalcular si la fórmula cambia.
 */
export const flameLog = pgTable(
  'flame_log',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    // Lunes de la semana, en formato AAAA-MM-DD.
    semanaInicio: date('semana_inicio').notNull(),
    sesionesPlaneadas: integer('sesiones_planeadas').notNull().default(0),
    sesionesCumplidas: integer('sesiones_cumplidas').notNull().default(0),
    // Descansar es parte de entrenar: un día libre que estaba en el plan no baja la llama.
    descansosPlaneados: integer('descansos_planeados').notNull().default(0),
    nivel: integer('nivel').notNull().default(0),
    // El nivel alcanzado es el piso. La llama se atenúa, nunca se reinicia.
    nivelPiso: integer('nivel_piso').notNull().default(0),
    creadoEn,
    actualizadoEn,
  },
  (t) => [uniqueIndex('flame_log_user_semana_uq').on(t.userId, t.semanaInicio)],
);

/** Medidas con cinta y báscula. Fuente de verdad del modelo del cuerpo. */
export const measurements = pgTable(
  'measurements',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    medidoEn: timestamp('medido_en', { withTimezone: true }).notNull().defaultNow(),
    pesoKg: real('peso_kg'),
    alturaCm: real('altura_cm'),
    pechoCm: real('pecho_cm'),
    cinturaCm: real('cintura_cm'),
    caderaCm: real('cadera_cm'),
    brazoCm: real('brazo_cm'),
    musloCm: real('muslo_cm'),
    pantorrillaCm: real('pantorrilla_cm'),
    grasaPct: real('grasa_pct'),
    // Sin el origen, la interfaz no puede rotular una estimación como tal, y
    // entonces la aplicación deja de ser un espejo y se vuelve un halago.
    grasaOrigen: text('grasa_origen', { enum: ORIGENES_DE_GRASA }),
    grasaMargenPct: real('grasa_margen_pct'),
    visibilidad: text('visibilidad', { enum: VISIBILIDADES }).notNull().default('privado'),
    creadoEn,
    actualizadoEn,
  },
  (t) => [index('measurements_user_medido_idx').on(t.userId, t.medidoEn)],
);

/** Fotos. Privadas por defecto y cifradas; los desconocidos jamás ven el cuerpo. */
export const photos = pgTable(
  'photos',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    tipo: text('tipo', { enum: TIPOS_DE_FOTO }).notNull(),
    angulo: text('angulo', { enum: ANGULOS_DE_FOTO }),
    sessionId: uuid('session_id').references(() => sessions.id, { onDelete: 'set null' }),
    measurementId: uuid('measurement_id').references(() => measurements.id, { onDelete: 'set null' }),
    // Ruta en el almacenamiento del dispositivo; la clave remota es el objeto en
    // R2, que solo se sirve por URL firmada. Nunca la imagen dentro de la base.
    rutaLocal: text('ruta_local'),
    claveRemota: text('clave_remota'),
    tomadaEn: timestamp('tomada_en', { withTimezone: true }).notNull().defaultNow(),
    visibilidad: text('visibilidad', { enum: VISIBILIDADES }).notNull().default('privado'),
    creadoEn,
    actualizadoEn,
  },
  (t) => [index('photos_user_tomada_idx').on(t.userId, t.tomadaEn)],
);

/** Alimentos. Se apoya en bases abiertas en vez de construir una propia. */
export const foods = pgTable(
  'foods',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
    nombre: text('nombre').notNull(),
    marca: text('marca'),
    codigoBarras: text('codigo_barras'),
    porcionGramos: real('porcion_gramos').notNull().default(100),
    kcal: real('kcal').notNull(),
    proteinaG: real('proteina_g').notNull().default(0),
    carbohidratosG: real('carbohidratos_g').notNull().default(0),
    grasaG: real('grasa_g').notNull().default(0),
    fuente: text('fuente', { enum: FUENTES_DE_ALIMENTO }).notNull().default('manual'),
    fuenteId: text('fuente_id'),
    creadoEn,
    actualizadoEn,
  },
  (t) => [index('foods_codigo_barras_idx').on(t.codigoBarras)],
);

export const foodLog = pgTable(
  'food_log',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    foodId: uuid('food_id')
      .notNull()
      .references(() => foods.id, { onDelete: 'restrict' }),
    comida: text('comida', { enum: COMIDAS }).notNull(),
    cantidadGramos: real('cantidad_gramos').notNull(),
    registradoEn: timestamp('registrado_en', { withTimezone: true }).notNull().defaultNow(),
    creadoEn,
    actualizadoEn,
  },
  (t) => [
    index('food_log_user_registrado_idx').on(t.userId, t.registradoEn),
    // food_log crece cinco veces al día y foods usa RESTRICT: sin este índice,
    // cada intento de borrar un alimento la escanea entera.
    index('food_log_food_idx').on(t.foodId),
  ],
);

/** Amistades. Solo existen cuando las dos partes aceptaron, y cada uno decide qué comparte. */
export const friendships = pgTable(
  'friendships',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    solicitanteId: uuid('solicitante_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    destinatarioId: uuid('destinatario_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    estado: text('estado', { enum: ESTADOS_DE_AMISTAD }).notNull().default('pendiente'),
    // Qué comparte cada uno. Nunca el horario detallado: solo si está libre u ocupado.
    compartirDescanso: boolean('compartir_descanso').notNull().default(true),
    compartirDisponibilidad: boolean('compartir_disponibilidad').notNull().default(true),
    creadoEn,
    actualizadoEn,
  },
  (t) => [
    uniqueIndex('friendships_par_uq').on(t.solicitanteId, t.destinatarioId),
    // El índice único solo sirve para buscar por solicitante. Este responde la
    // otra mitad de la pregunta: quién me agregó a mí.
    index('friendships_destinatario_idx').on(t.destinatarioId),
  ],
);

export type User = typeof users.$inferSelect;
export type NuevoUser = typeof users.$inferInsert;
export type Exercise = typeof exercises.$inferSelect;
export type NuevoExercise = typeof exercises.$inferInsert;
export type Gym = typeof gyms.$inferSelect;
export type NuevoGym = typeof gyms.$inferInsert;
export type GymMachine = typeof gymMachines.$inferSelect;
export type NuevaGymMachine = typeof gymMachines.$inferInsert;
export type TimeBlock = typeof timeBlocks.$inferSelect;
export type NuevoTimeBlock = typeof timeBlocks.$inferInsert;
export type Routine = typeof routines.$inferSelect;
export type NuevaRoutine = typeof routines.$inferInsert;
export type RoutineExercise = typeof routineExercises.$inferSelect;
export type NuevoRoutineExercise = typeof routineExercises.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type NuevaSession = typeof sessions.$inferInsert;
export type Set = typeof sets.$inferSelect;
export type NuevoSet = typeof sets.$inferInsert;
export type FlameLog = typeof flameLog.$inferSelect;
export type NuevoFlameLog = typeof flameLog.$inferInsert;
export type Measurement = typeof measurements.$inferSelect;
export type NuevaMeasurement = typeof measurements.$inferInsert;
export type Photo = typeof photos.$inferSelect;
export type NuevaPhoto = typeof photos.$inferInsert;
export type Food = typeof foods.$inferSelect;
export type NuevoFood = typeof foods.$inferInsert;
export type FoodLog = typeof foodLog.$inferSelect;
export type NuevoFoodLog = typeof foodLog.$inferInsert;
export type Friendship = typeof friendships.$inferSelect;
export type NuevaFriendship = typeof friendships.$inferInsert;
