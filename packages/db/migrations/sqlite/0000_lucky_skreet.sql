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
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`nombre` text NOT NULL,
	`creado_en` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`actualizado_en` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);