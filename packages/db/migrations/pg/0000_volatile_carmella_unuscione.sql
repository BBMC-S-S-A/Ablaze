CREATE TABLE "exercises" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"nombre" text NOT NULL,
	"musculo_principal" text NOT NULL,
	"musculos_secundarios" text[] DEFAULT '{}' NOT NULL,
	"equipamiento" text NOT NULL,
	"unilateral" boolean DEFAULT false NOT NULL,
	"visibilidad" text DEFAULT 'privado' NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL,
	"actualizado_en" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "flame_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"semana_inicio" date NOT NULL,
	"sesiones_planeadas" integer DEFAULT 0 NOT NULL,
	"sesiones_cumplidas" integer DEFAULT 0 NOT NULL,
	"descansos_planeados" integer DEFAULT 0 NOT NULL,
	"nivel" integer DEFAULT 0 NOT NULL,
	"nivel_piso" integer DEFAULT 0 NOT NULL,
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL,
	"actualizado_en" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "food_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"food_id" uuid NOT NULL,
	"comida" text NOT NULL,
	"cantidad_gramos" real NOT NULL,
	"registrado_en" timestamp with time zone DEFAULT now() NOT NULL,
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL,
	"actualizado_en" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "foods" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"nombre" text NOT NULL,
	"marca" text,
	"codigo_barras" text,
	"porcion_gramos" real DEFAULT 100 NOT NULL,
	"kcal" real NOT NULL,
	"proteina_g" real DEFAULT 0 NOT NULL,
	"carbohidratos_g" real DEFAULT 0 NOT NULL,
	"grasa_g" real DEFAULT 0 NOT NULL,
	"fuente" text DEFAULT 'manual' NOT NULL,
	"fuente_id" text,
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL,
	"actualizado_en" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "friendships" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"solicitante_id" uuid NOT NULL,
	"destinatario_id" uuid NOT NULL,
	"estado" text DEFAULT 'pendiente' NOT NULL,
	"compartir_descanso" boolean DEFAULT true NOT NULL,
	"compartir_disponibilidad" boolean DEFAULT true NOT NULL,
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL,
	"actualizado_en" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gym_machines" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"gym_id" uuid NOT NULL,
	"exercise_id" uuid,
	"nombre" text NOT NULL,
	"marca" text,
	"equipamiento" text NOT NULL,
	"placa_a_kg" jsonb,
	"peso_minimo_kg" real,
	"incremento_kg" real,
	"cantidad" integer DEFAULT 1 NOT NULL,
	"creado_por" uuid,
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL,
	"actualizado_en" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gyms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"creado_por" uuid,
	"nombre" text NOT NULL,
	"direccion" text,
	"ciudad" text,
	"latitud" real,
	"longitud" real,
	"verificado" boolean DEFAULT false NOT NULL,
	"visibilidad" text DEFAULT 'publico' NOT NULL,
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL,
	"actualizado_en" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "measurements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"medido_en" timestamp with time zone DEFAULT now() NOT NULL,
	"peso_kg" real,
	"altura_cm" real,
	"pecho_cm" real,
	"cintura_cm" real,
	"cadera_cm" real,
	"brazo_cm" real,
	"muslo_cm" real,
	"pantorrilla_cm" real,
	"grasa_pct" real,
	"grasa_origen" text,
	"grasa_margen_pct" real,
	"visibilidad" text DEFAULT 'privado' NOT NULL,
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL,
	"actualizado_en" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "photos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"tipo" text NOT NULL,
	"angulo" text,
	"session_id" uuid,
	"measurement_id" uuid,
	"ruta_local" text,
	"clave_remota" text,
	"tomada_en" timestamp with time zone DEFAULT now() NOT NULL,
	"visibilidad" text DEFAULT 'privado' NOT NULL,
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL,
	"actualizado_en" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "routine_exercises" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"routine_id" uuid NOT NULL,
	"exercise_id" uuid NOT NULL,
	"orden" integer NOT NULL,
	"series_objetivo" integer,
	"repeticiones_objetivo" integer,
	"descanso_segundos" integer,
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL,
	"actualizado_en" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "routines" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"nombre" text NOT NULL,
	"notas" text,
	"copiada_de" uuid,
	"visibilidad" text DEFAULT 'privado' NOT NULL,
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL,
	"actualizado_en" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"time_block_id" uuid,
	"routine_id" uuid,
	"gym_id" uuid,
	"inicio" timestamp with time zone NOT NULL,
	"fin" timestamp with time zone,
	"notas" text,
	"visibilidad" text DEFAULT 'privado' NOT NULL,
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL,
	"actualizado_en" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"session_id" uuid NOT NULL,
	"exercise_id" uuid NOT NULL,
	"gym_machine_id" uuid,
	"orden" integer NOT NULL,
	"repeticiones" integer NOT NULL,
	"peso_kg" real,
	"placa" integer,
	"esfuerzo" integer,
	"lado" text DEFAULT 'ambos' NOT NULL,
	"calentamiento" boolean DEFAULT false NOT NULL,
	"completada_en" timestamp with time zone DEFAULT now() NOT NULL,
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL,
	"actualizado_en" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "time_blocks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"tipo" text NOT NULL,
	"titulo" text,
	"inicio" timestamp with time zone NOT NULL,
	"fin" timestamp with time zone NOT NULL,
	"repeticion" text DEFAULT 'ninguna' NOT NULL,
	"repeticion_hasta" timestamp with time zone,
	"gym_id" uuid,
	"visibilidad" text DEFAULT 'privado' NOT NULL,
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL,
	"actualizado_en" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"nombre" text NOT NULL,
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL,
	"actualizado_en" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "exercises" ADD CONSTRAINT "exercises_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "flame_log" ADD CONSTRAINT "flame_log_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "food_log" ADD CONSTRAINT "food_log_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "food_log" ADD CONSTRAINT "food_log_food_id_foods_id_fk" FOREIGN KEY ("food_id") REFERENCES "public"."foods"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "foods" ADD CONSTRAINT "foods_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friendships" ADD CONSTRAINT "friendships_solicitante_id_users_id_fk" FOREIGN KEY ("solicitante_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friendships" ADD CONSTRAINT "friendships_destinatario_id_users_id_fk" FOREIGN KEY ("destinatario_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gym_machines" ADD CONSTRAINT "gym_machines_gym_id_gyms_id_fk" FOREIGN KEY ("gym_id") REFERENCES "public"."gyms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gym_machines" ADD CONSTRAINT "gym_machines_exercise_id_exercises_id_fk" FOREIGN KEY ("exercise_id") REFERENCES "public"."exercises"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gym_machines" ADD CONSTRAINT "gym_machines_creado_por_users_id_fk" FOREIGN KEY ("creado_por") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gyms" ADD CONSTRAINT "gyms_creado_por_users_id_fk" FOREIGN KEY ("creado_por") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "measurements" ADD CONSTRAINT "measurements_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "photos" ADD CONSTRAINT "photos_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "photos" ADD CONSTRAINT "photos_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "photos" ADD CONSTRAINT "photos_measurement_id_measurements_id_fk" FOREIGN KEY ("measurement_id") REFERENCES "public"."measurements"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "routine_exercises" ADD CONSTRAINT "routine_exercises_routine_id_routines_id_fk" FOREIGN KEY ("routine_id") REFERENCES "public"."routines"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "routine_exercises" ADD CONSTRAINT "routine_exercises_exercise_id_exercises_id_fk" FOREIGN KEY ("exercise_id") REFERENCES "public"."exercises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "routines" ADD CONSTRAINT "routines_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_time_block_id_time_blocks_id_fk" FOREIGN KEY ("time_block_id") REFERENCES "public"."time_blocks"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_routine_id_routines_id_fk" FOREIGN KEY ("routine_id") REFERENCES "public"."routines"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_gym_id_gyms_id_fk" FOREIGN KEY ("gym_id") REFERENCES "public"."gyms"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sets" ADD CONSTRAINT "sets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sets" ADD CONSTRAINT "sets_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sets" ADD CONSTRAINT "sets_exercise_id_exercises_id_fk" FOREIGN KEY ("exercise_id") REFERENCES "public"."exercises"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sets" ADD CONSTRAINT "sets_gym_machine_id_gym_machines_id_fk" FOREIGN KEY ("gym_machine_id") REFERENCES "public"."gym_machines"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "time_blocks" ADD CONSTRAINT "time_blocks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "time_blocks" ADD CONSTRAINT "time_blocks_gym_id_gyms_id_fk" FOREIGN KEY ("gym_id") REFERENCES "public"."gyms"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "exercises_musculo_principal_idx" ON "exercises" USING btree ("musculo_principal");--> statement-breakpoint
CREATE UNIQUE INDEX "flame_log_user_semana_uq" ON "flame_log" USING btree ("user_id","semana_inicio");--> statement-breakpoint
CREATE INDEX "food_log_user_registrado_idx" ON "food_log" USING btree ("user_id","registrado_en");--> statement-breakpoint
CREATE INDEX "food_log_food_idx" ON "food_log" USING btree ("food_id");--> statement-breakpoint
CREATE INDEX "foods_codigo_barras_idx" ON "foods" USING btree ("codigo_barras");--> statement-breakpoint
CREATE UNIQUE INDEX "friendships_par_uq" ON "friendships" USING btree ("solicitante_id","destinatario_id");--> statement-breakpoint
CREATE INDEX "friendships_destinatario_idx" ON "friendships" USING btree ("destinatario_id");--> statement-breakpoint
CREATE INDEX "gym_machines_gym_idx" ON "gym_machines" USING btree ("gym_id");--> statement-breakpoint
CREATE INDEX "gyms_ciudad_idx" ON "gyms" USING btree ("ciudad");--> statement-breakpoint
CREATE INDEX "measurements_user_medido_idx" ON "measurements" USING btree ("user_id","medido_en");--> statement-breakpoint
CREATE INDEX "photos_user_tomada_idx" ON "photos" USING btree ("user_id","tomada_en");--> statement-breakpoint
CREATE INDEX "routine_exercises_routine_idx" ON "routine_exercises" USING btree ("routine_id","orden");--> statement-breakpoint
CREATE INDEX "routines_user_idx" ON "routines" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "sessions_user_inicio_idx" ON "sessions" USING btree ("user_id","inicio");--> statement-breakpoint
CREATE INDEX "sessions_time_block_idx" ON "sessions" USING btree ("time_block_id");--> statement-breakpoint
CREATE INDEX "sessions_routine_idx" ON "sessions" USING btree ("routine_id");--> statement-breakpoint
CREATE INDEX "sets_session_orden_idx" ON "sets" USING btree ("session_id","orden");--> statement-breakpoint
CREATE INDEX "sets_user_exercise_idx" ON "sets" USING btree ("user_id","exercise_id","completada_en");--> statement-breakpoint
CREATE INDEX "sets_exercise_idx" ON "sets" USING btree ("exercise_id");--> statement-breakpoint
CREATE INDEX "sets_gym_machine_idx" ON "sets" USING btree ("gym_machine_id");--> statement-breakpoint
CREATE INDEX "time_blocks_user_inicio_idx" ON "time_blocks" USING btree ("user_id","inicio");