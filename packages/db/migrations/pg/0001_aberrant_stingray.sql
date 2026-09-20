CREATE TABLE "injuries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"zona" text NOT NULL,
	"lado" text DEFAULT 'ambos' NOT NULL,
	"descripcion" text,
	"desde" date,
	"activa" boolean DEFAULT true NOT NULL,
	"visibilidad" text DEFAULT 'privado' NOT NULL,
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL,
	"actualizado_en" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"objetivos" text[] DEFAULT '{}' NOT NULL,
	"compromiso" text,
	"sexo" text,
	"edad_declarada" integer,
	"edad_declarada_en" date,
	"gym_principal_id" uuid,
	"comidas_por_dia" integer,
	"desayuna" boolean,
	"ayuno_intermitente" boolean,
	"quien_cocina" text,
	"cardio_tipo" text,
	"cardio_minutos" integer,
	"cardio_intensidad" text,
	"suplementos" text[] DEFAULT '{}' NOT NULL,
	"horas_sueno_min" integer,
	"horas_sueno_max" integer,
	"hora_de_acostarse" text,
	"reloj" text DEFAULT 'ninguno' NOT NULL,
	"reloj_modelo" text,
	"duerme_con_reloj" boolean,
	"exigencia" text,
	"onboarding_paso" integer DEFAULT 0 NOT NULL,
	"onboarding_completado_en" timestamp with time zone,
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL,
	"actualizado_en" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "user_foods" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"food_id" uuid NOT NULL,
	"habitual" boolean DEFAULT true NOT NULL,
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL,
	"actualizado_en" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "injuries" ADD CONSTRAINT "injuries_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_gym_principal_id_gyms_id_fk" FOREIGN KEY ("gym_principal_id") REFERENCES "public"."gyms"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_foods" ADD CONSTRAINT "user_foods_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_foods" ADD CONSTRAINT "user_foods_food_id_foods_id_fk" FOREIGN KEY ("food_id") REFERENCES "public"."foods"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "injuries_user_activa_idx" ON "injuries" USING btree ("user_id","activa");--> statement-breakpoint
CREATE UNIQUE INDEX "user_foods_par_uq" ON "user_foods" USING btree ("user_id","food_id");--> statement-breakpoint
CREATE INDEX "user_foods_food_idx" ON "user_foods" USING btree ("food_id");