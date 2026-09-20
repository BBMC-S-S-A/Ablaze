CREATE TABLE `exercises` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`nombre` text NOT NULL,
	`musculo_principal` text NOT NULL,
	`musculos_secundarios` text DEFAULT '[]' NOT NULL,
	`equipamiento` text NOT NULL,
	`unilateral` integer DEFAULT false NOT NULL,
	`visibilidad` text DEFAULT 'privado' NOT NULL,
	`version` integer DEFAULT 1 NOT NULL,
	`creado_en` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`actualizado_en` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `exercises_musculo_principal_idx` ON `exercises` (`musculo_principal`);--> statement-breakpoint
CREATE TABLE `flame_log` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`semana_inicio` text NOT NULL,
	`sesiones_planeadas` integer DEFAULT 0 NOT NULL,
	`sesiones_cumplidas` integer DEFAULT 0 NOT NULL,
	`descansos_planeados` integer DEFAULT 0 NOT NULL,
	`nivel` integer DEFAULT 0 NOT NULL,
	`nivel_piso` integer DEFAULT 0 NOT NULL,
	`creado_en` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`actualizado_en` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `flame_log_user_semana_uq` ON `flame_log` (`user_id`,`semana_inicio`);--> statement-breakpoint
CREATE TABLE `food_log` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`food_id` text NOT NULL,
	`comida` text NOT NULL,
	`cantidad_gramos` real NOT NULL,
	`registrado_en` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`creado_en` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`actualizado_en` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`food_id`) REFERENCES `foods`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE INDEX `food_log_user_registrado_idx` ON `food_log` (`user_id`,`registrado_en`);--> statement-breakpoint
CREATE INDEX `food_log_food_idx` ON `food_log` (`food_id`);--> statement-breakpoint
CREATE TABLE `foods` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`nombre` text NOT NULL,
	`marca` text,
	`codigo_barras` text,
	`porcion_gramos` real DEFAULT 100 NOT NULL,
	`kcal` real NOT NULL,
	`proteina_g` real DEFAULT 0 NOT NULL,
	`carbohidratos_g` real DEFAULT 0 NOT NULL,
	`grasa_g` real DEFAULT 0 NOT NULL,
	`fuente` text DEFAULT 'manual' NOT NULL,
	`fuente_id` text,
	`creado_en` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`actualizado_en` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `foods_codigo_barras_idx` ON `foods` (`codigo_barras`);--> statement-breakpoint
CREATE TABLE `friendships` (
	`id` text PRIMARY KEY NOT NULL,
	`solicitante_id` text NOT NULL,
	`destinatario_id` text NOT NULL,
	`estado` text DEFAULT 'pendiente' NOT NULL,
	`compartir_descanso` integer DEFAULT true NOT NULL,
	`compartir_disponibilidad` integer DEFAULT true NOT NULL,
	`creado_en` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`actualizado_en` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`solicitante_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`destinatario_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `friendships_par_uq` ON `friendships` (`solicitante_id`,`destinatario_id`);--> statement-breakpoint
CREATE INDEX `friendships_destinatario_idx` ON `friendships` (`destinatario_id`);--> statement-breakpoint
CREATE TABLE `gym_machines` (
	`id` text PRIMARY KEY NOT NULL,
	`gym_id` text NOT NULL,
	`exercise_id` text,
	`nombre` text NOT NULL,
	`marca` text,
	`equipamiento` text NOT NULL,
	`placa_a_kg` text,
	`peso_minimo_kg` real,
	`incremento_kg` real,
	`cantidad` integer DEFAULT 1 NOT NULL,
	`creado_por` text,
	`creado_en` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`actualizado_en` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`gym_id`) REFERENCES `gyms`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`exercise_id`) REFERENCES `exercises`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`creado_por`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `gym_machines_gym_idx` ON `gym_machines` (`gym_id`);--> statement-breakpoint
CREATE TABLE `gyms` (
	`id` text PRIMARY KEY NOT NULL,
	`creado_por` text,
	`nombre` text NOT NULL,
	`direccion` text,
	`ciudad` text,
	`latitud` real,
	`longitud` real,
	`verificado` integer DEFAULT false NOT NULL,
	`visibilidad` text DEFAULT 'publico' NOT NULL,
	`creado_en` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`actualizado_en` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`creado_por`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `gyms_ciudad_idx` ON `gyms` (`ciudad`);--> statement-breakpoint
CREATE TABLE `measurements` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`medido_en` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`peso_kg` real,
	`altura_cm` real,
	`pecho_cm` real,
	`cintura_cm` real,
	`cadera_cm` real,
	`brazo_cm` real,
	`muslo_cm` real,
	`pantorrilla_cm` real,
	`grasa_pct` real,
	`grasa_origen` text,
	`grasa_margen_pct` real,
	`visibilidad` text DEFAULT 'privado' NOT NULL,
	`creado_en` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`actualizado_en` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `measurements_user_medido_idx` ON `measurements` (`user_id`,`medido_en`);--> statement-breakpoint
CREATE TABLE `photos` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`tipo` text NOT NULL,
	`angulo` text,
	`session_id` text,
	`measurement_id` text,
	`ruta_local` text,
	`clave_remota` text,
	`tomada_en` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`visibilidad` text DEFAULT 'privado' NOT NULL,
	`creado_en` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`actualizado_en` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`session_id`) REFERENCES `sessions`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`measurement_id`) REFERENCES `measurements`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `photos_user_tomada_idx` ON `photos` (`user_id`,`tomada_en`);--> statement-breakpoint
CREATE TABLE `routine_exercises` (
	`id` text PRIMARY KEY NOT NULL,
	`routine_id` text NOT NULL,
	`exercise_id` text NOT NULL,
	`orden` integer NOT NULL,
	`series_objetivo` integer,
	`repeticiones_objetivo` integer,
	`descanso_segundos` integer,
	`creado_en` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`actualizado_en` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`routine_id`) REFERENCES `routines`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`exercise_id`) REFERENCES `exercises`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `routine_exercises_routine_idx` ON `routine_exercises` (`routine_id`,`orden`);--> statement-breakpoint
CREATE TABLE `routines` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`nombre` text NOT NULL,
	`notas` text,
	`copiada_de` text,
	`visibilidad` text DEFAULT 'privado' NOT NULL,
	`creado_en` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`actualizado_en` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `routines_user_idx` ON `routines` (`user_id`);--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`time_block_id` text,
	`routine_id` text,
	`gym_id` text,
	`inicio` integer NOT NULL,
	`fin` integer,
	`notas` text,
	`visibilidad` text DEFAULT 'privado' NOT NULL,
	`creado_en` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`actualizado_en` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`time_block_id`) REFERENCES `time_blocks`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`routine_id`) REFERENCES `routines`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`gym_id`) REFERENCES `gyms`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `sessions_user_inicio_idx` ON `sessions` (`user_id`,`inicio`);--> statement-breakpoint
CREATE INDEX `sessions_time_block_idx` ON `sessions` (`time_block_id`);--> statement-breakpoint
CREATE INDEX `sessions_routine_idx` ON `sessions` (`routine_id`);--> statement-breakpoint
CREATE TABLE `sets` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`session_id` text NOT NULL,
	`exercise_id` text NOT NULL,
	`gym_machine_id` text,
	`orden` integer NOT NULL,
	`repeticiones` integer NOT NULL,
	`peso_kg` real,
	`placa` integer,
	`esfuerzo` integer,
	`lado` text DEFAULT 'ambos' NOT NULL,
	`calentamiento` integer DEFAULT false NOT NULL,
	`completada_en` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`creado_en` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`actualizado_en` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`session_id`) REFERENCES `sessions`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`exercise_id`) REFERENCES `exercises`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`gym_machine_id`) REFERENCES `gym_machines`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `sets_session_orden_idx` ON `sets` (`session_id`,`orden`);--> statement-breakpoint
CREATE INDEX `sets_user_exercise_idx` ON `sets` (`user_id`,`exercise_id`,`completada_en`);--> statement-breakpoint
CREATE INDEX `sets_exercise_idx` ON `sets` (`exercise_id`);--> statement-breakpoint
CREATE INDEX `sets_gym_machine_idx` ON `sets` (`gym_machine_id`);--> statement-breakpoint
CREATE TABLE `time_blocks` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`tipo` text NOT NULL,
	`titulo` text,
	`inicio` integer NOT NULL,
	`fin` integer NOT NULL,
	`repeticion` text DEFAULT 'ninguna' NOT NULL,
	`repeticion_hasta` integer,
	`gym_id` text,
	`visibilidad` text DEFAULT 'privado' NOT NULL,
	`creado_en` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`actualizado_en` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`gym_id`) REFERENCES `gyms`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `time_blocks_user_inicio_idx` ON `time_blocks` (`user_id`,`inicio`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`nombre` text NOT NULL,
	`creado_en` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`actualizado_en` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);