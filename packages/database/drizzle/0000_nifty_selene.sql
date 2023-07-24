DO $$ BEGIN
 CREATE TYPE "album_type" AS ENUM('album', 'single', 'compilation');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "privacy" AS ENUM('public', 'private');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "albums" (
	"id" varchar(22) PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"release_date" timestamp NOT NULL,
	"release_date_precision" text NOT NULL,
	"label" text NOT NULL,
	"popularity" double precision NOT NULL,
	"album_type" "album_type" NOT NULL,
	"url" text NOT NULL,
	"total_tracks" integer NOT NULL,
	"images_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "artists" (
	"id" varchar(22) PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"followers" double precision NOT NULL,
	"url" text NOT NULL,
	"popularity" double precision NOT NULL,
	"images_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "artists_to_genres" (
	"artist_id" varchar(22) NOT NULL,
	"genre_id" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "artists_to_genres" ADD CONSTRAINT "artists_to_genres_artist_id_genre_id" PRIMARY KEY("artist_id","genre_id");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "audio_features" (
	"id" varchar(22) PRIMARY KEY NOT NULL,
	"tempo" double precision NOT NULL,
	"energy" double precision NOT NULL,
	"loudness" double precision NOT NULL,
	"dancebility" double precision NOT NULL,
	"instrumentalness" double precision NOT NULL,
	"acousticness" double precision NOT NULL,
	"speechiness" double precision NOT NULL,
	"liveness" double precision NOT NULL,
	"valence" double precision NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "follows" (
	"id" serial PRIMARY KEY NOT NULL,
	"follower_id" varchar(22) NOT NULL,
	"followee_id" varchar(22) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "genres" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "history" (
	"id" serial PRIMARY KEY NOT NULL,
	"played_at" timestamp NOT NULL,
	"track_id" varchar(22) NOT NULL,
	"user_id" varchar(22) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "images" (
	"id" serial PRIMARY KEY NOT NULL,
	"high" text NOT NULL,
	"medium" text NOT NULL,
	"low" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tracks" (
	"id" varchar(22) PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"duration_ms" integer NOT NULL,
	"release_date" timestamp NOT NULL,
	"popularity" double precision NOT NULL,
	"track_number" integer NOT NULL,
	"disc_number" integer NOT NULL,
	"preview_url" text DEFAULT '',
	"url" text NOT NULL,
	"is_local" boolean NOT NULL,
	"explicit" boolean NOT NULL,
	"images_id" integer NOT NULL,
	"album_id" varchar(22) NOT NULL,
	"artist_id" varchar(22) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" varchar(22) PRIMARY KEY NOT NULL,
	"display_name" text NOT NULL,
	"email" text DEFAULT '',
	"avatar" text DEFAULT '',
	"country" text NOT NULL,
	"privacy" "privacy" DEFAULT 'public',
	"filter_enabled" boolean NOT NULL,
	"url" text NOT NULL,
	"product" text NOT NULL,
	"type" text NOT NULL,
	"access_token" text NOT NULL,
	"refresh_token" text NOT NULL,
	"refresh_is_valid" boolean DEFAULT true,
	"last_login" timestamp DEFAULT now(),
	"registration_date" timestamp DEFAULT now()
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "albums" ADD CONSTRAINT "albums_images_id_images_id_fk" FOREIGN KEY ("images_id") REFERENCES "images"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "artists" ADD CONSTRAINT "artists_images_id_images_id_fk" FOREIGN KEY ("images_id") REFERENCES "images"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "artists_to_genres" ADD CONSTRAINT "artists_to_genres_artist_id_artists_id_fk" FOREIGN KEY ("artist_id") REFERENCES "artists"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "artists_to_genres" ADD CONSTRAINT "artists_to_genres_genre_id_genres_id_fk" FOREIGN KEY ("genre_id") REFERENCES "genres"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "audio_features" ADD CONSTRAINT "audio_features_id_tracks_id_fk" FOREIGN KEY ("id") REFERENCES "tracks"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "follows" ADD CONSTRAINT "follows_follower_id_users_id_fk" FOREIGN KEY ("follower_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "follows" ADD CONSTRAINT "follows_followee_id_users_id_fk" FOREIGN KEY ("followee_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "history" ADD CONSTRAINT "history_track_id_tracks_id_fk" FOREIGN KEY ("track_id") REFERENCES "tracks"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "history" ADD CONSTRAINT "history_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tracks" ADD CONSTRAINT "tracks_images_id_images_id_fk" FOREIGN KEY ("images_id") REFERENCES "images"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tracks" ADD CONSTRAINT "tracks_album_id_albums_id_fk" FOREIGN KEY ("album_id") REFERENCES "albums"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tracks" ADD CONSTRAINT "tracks_artist_id_artists_id_fk" FOREIGN KEY ("artist_id") REFERENCES "artists"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
