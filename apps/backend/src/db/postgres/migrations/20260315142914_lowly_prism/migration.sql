CREATE TABLE "account" (
	"id" text PRIMARY KEY,
	"user_id" text NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "albums" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "albums_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"spotify_id" varchar(255) NOT NULL UNIQUE,
	"name" varchar(500) NOT NULL,
	"album_type" varchar(50),
	"release_date" varchar(20),
	"images" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "artists" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "artists_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"spotify_id" varchar(255) NOT NULL UNIQUE,
	"name" varchar(500) NOT NULL,
	"genres" jsonb,
	"images" jsonb,
	"popularity" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audio_features" (
	"track_id" bigint PRIMARY KEY,
	"danceability" double precision,
	"energy" double precision,
	"key" integer,
	"loudness" double precision,
	"mode" integer,
	"speechiness" double precision,
	"acousticness" double precision,
	"instrumentalness" double precision,
	"liveness" double precision,
	"valence" double precision,
	"tempo" double precision,
	"time_signature" integer
);
--> statement-breakpoint
CREATE TABLE "history" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "history_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"user_id" text NOT NULL,
	"track_id" bigint NOT NULL,
	"played_at" timestamp NOT NULL,
	CONSTRAINT "history_user_played_at_unique" UNIQUE("user_id","played_at")
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY,
	"user_id" text NOT NULL,
	"token" text NOT NULL UNIQUE,
	"expires_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "track_artists" (
	"track_id" bigint,
	"artist_id" bigint,
	CONSTRAINT "track_artists_pkey" PRIMARY KEY("track_id","artist_id")
);
--> statement-breakpoint
CREATE TABLE "tracks" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "tracks_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"spotify_id" varchar(255) NOT NULL UNIQUE,
	"name" varchar(500) NOT NULL,
	"duration_ms" integer,
	"explicit" boolean,
	"popularity" integer,
	"album_id" bigint,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY,
	"name" text NOT NULL,
	"email" text NOT NULL UNIQUE,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"spotify_id" varchar(255) UNIQUE,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE INDEX "history_user_id_idx" ON "history" ("user_id");--> statement-breakpoint
CREATE INDEX "history_track_id_idx" ON "history" ("track_id");--> statement-breakpoint
CREATE INDEX "history_played_at_idx" ON "history" ("played_at");--> statement-breakpoint
CREATE INDEX "track_artists_artist_id_idx" ON "track_artists" ("artist_id");--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "audio_features" ADD CONSTRAINT "audio_features_track_id_tracks_id_fkey" FOREIGN KEY ("track_id") REFERENCES "tracks"("id");--> statement-breakpoint
ALTER TABLE "history" ADD CONSTRAINT "history_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id");--> statement-breakpoint
ALTER TABLE "history" ADD CONSTRAINT "history_track_id_tracks_id_fkey" FOREIGN KEY ("track_id") REFERENCES "tracks"("id");--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "track_artists" ADD CONSTRAINT "track_artists_track_id_tracks_id_fkey" FOREIGN KEY ("track_id") REFERENCES "tracks"("id");--> statement-breakpoint
ALTER TABLE "track_artists" ADD CONSTRAINT "track_artists_artist_id_artists_id_fkey" FOREIGN KEY ("artist_id") REFERENCES "artists"("id");--> statement-breakpoint
ALTER TABLE "tracks" ADD CONSTRAINT "tracks_album_id_albums_id_fkey" FOREIGN KEY ("album_id") REFERENCES "albums"("id");