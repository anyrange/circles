CREATE TABLE "ai_cache" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "ai_cache_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"user_id" text NOT NULL,
	"type" varchar(50) NOT NULL,
	"bucket" varchar(20) NOT NULL,
	"response" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "ai_cache_user_id_type_bucket_unique" UNIQUE("user_id","type","bucket")
);
--> statement-breakpoint
CREATE TABLE "follows" (
	"follower_id" text,
	"following_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "follows_pkey" PRIMARY KEY("follower_id","following_id")
);
--> statement-breakpoint
CREATE TABLE "import_jobs" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "import_jobs_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"user_id" text NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"s3_key" varchar(500) NOT NULL,
	"total_tracks" integer,
	"imported_tracks" integer,
	"error_message" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "playlist_tracks" (
	"playlist_id" bigint,
	"track_id" bigint,
	"position" integer NOT NULL,
	"added_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "playlist_tracks_pkey" PRIMARY KEY("playlist_id","track_id")
);
--> statement-breakpoint
CREATE TABLE "playlists" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "playlists_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"user_id" text NOT NULL,
	"name" varchar(500) NOT NULL,
	"description" text,
	"is_auto" boolean DEFAULT false NOT NULL,
	"spotify_id" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "username" varchar(50);--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "is_public" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "bio" text;--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_username_key" UNIQUE("username");--> statement-breakpoint
CREATE INDEX "follows_following_id_idx" ON "follows" ("following_id");--> statement-breakpoint
CREATE INDEX "history_user_played_at_desc_idx" ON "history" ("user_id","played_at");--> statement-breakpoint
CREATE INDEX "playlists_user_id_idx" ON "playlists" ("user_id");--> statement-breakpoint
ALTER TABLE "ai_cache" ADD CONSTRAINT "ai_cache_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "follows" ADD CONSTRAINT "follows_follower_id_user_id_fkey" FOREIGN KEY ("follower_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "follows" ADD CONSTRAINT "follows_following_id_user_id_fkey" FOREIGN KEY ("following_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "import_jobs" ADD CONSTRAINT "import_jobs_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "playlist_tracks" ADD CONSTRAINT "playlist_tracks_playlist_id_playlists_id_fkey" FOREIGN KEY ("playlist_id") REFERENCES "playlists"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "playlist_tracks" ADD CONSTRAINT "playlist_tracks_track_id_tracks_id_fkey" FOREIGN KEY ("track_id") REFERENCES "tracks"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "playlists" ADD CONSTRAINT "playlists_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;