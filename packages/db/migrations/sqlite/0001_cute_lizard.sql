CREATE TABLE `injuries` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`zona` text NOT NULL,
	`lado` text DEFAULT 'ambos' NOT NULL,
	`descripcion` text,
	`desde` text,
	`activa` integer DEFAULT true NOT NULL,
	`visibilidad` text DEFAULT 'privado' NOT NULL,
	`creado_en` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`actualizado_en` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `injuries_user_activa_idx` ON `injuries` (`user_id`,`activa`);--> statement-breakpoint
CREATE TABLE `profiles` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`objetivos` text DEFAULT '[]' NOT NULL,
	`compromiso` text,
	`sexo` text,
	`edad_declarada` integer,
	`edad_declarada_en` text,
	`gym_principal_id` text,
	`comidas_por_dia` integer,
	`desayuna` integer,
	`ayuno_intermitente` integer,
	`quien_cocina` text,
	`cardio_tipo` text,
	`cardio_minutos` integer,
	`cardio_intensidad` text,
	`suplementos` text DEFAULT '[]' NOT NULL,
	`horas_sueno_min` integer,
	`horas_sueno_max` integer,
	`hora_de_acostarse` text,
	`reloj` text DEFAULT 'ninguno' NOT NULL,
	`reloj_modelo` text,
	`duerme_con_reloj` integer,
	`exigencia` text,
	`onboarding_paso` integer DEFAULT 0 NOT NULL,
	`onboarding_completado_en` integer,
	`creado_en` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`actualizado_en` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`gym_principal_id`) REFERENCES `gyms`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `profiles_user_id_unique` ON `profiles` (`user_id`);--> statement-breakpoint
CREATE TABLE `user_foods` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`food_id` text NOT NULL,
	`habitual` integer DEFAULT true NOT NULL,
	`creado_en` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`actualizado_en` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`food_id`) REFERENCES `foods`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_foods_par_uq` ON `user_foods` (`user_id`,`food_id`);--> statement-breakpoint
CREATE INDEX `user_foods_food_idx` ON `user_foods` (`food_id`);