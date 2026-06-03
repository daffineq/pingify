CREATE TABLE "service" (
	"id" varchar(255) PRIMARY KEY,
	"user_id" varchar(255) NOT NULL,
	"name" text,
	"url" text NOT NULL,
	"interval" integer DEFAULT 10 NOT NULL,
	"last_checked" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "service_check" (
	"id" varchar(255) PRIMARY KEY,
	"service_id" varchar(255) NOT NULL,
	"status" integer NOT NULL,
	"latency_ms" integer NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" varchar(255) PRIMARY KEY,
	"user_id" varchar(255) NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"active_until" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" varchar(255) PRIMARY KEY,
	"name" varchar(255) NOT NULL UNIQUE,
	"password" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "service" ADD CONSTRAINT "service_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "service_check" ADD CONSTRAINT "service_check_service_id_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "service"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;