CREATE TABLE IF NOT EXISTS "user_socials" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(30) NOT NULL,
	"twitter" text DEFAULT '' NOT NULL,
	"facebook" text DEFAULT '' NOT NULL,
	"youtube" text DEFAULT '' NOT NULL,
	"telegram" text DEFAULT '' NOT NULL,
	"spotify" text DEFAULT '' NOT NULL,
	"apple" text DEFAULT '' NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN IF EXISTS "url";--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_socials" ADD CONSTRAINT "user_socials_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
