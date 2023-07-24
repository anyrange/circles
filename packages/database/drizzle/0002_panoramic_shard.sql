ALTER TABLE "albums" ALTER COLUMN "id" SET DATA TYPE varchar(30);--> statement-breakpoint
ALTER TABLE "artists" ALTER COLUMN "id" SET DATA TYPE varchar(30);--> statement-breakpoint
ALTER TABLE "artists_to_genres" ALTER COLUMN "artist_id" SET DATA TYPE varchar(30);--> statement-breakpoint
ALTER TABLE "audio_features" ALTER COLUMN "id" SET DATA TYPE varchar(30);--> statement-breakpoint
ALTER TABLE "follows" ALTER COLUMN "follower_id" SET DATA TYPE varchar(30);--> statement-breakpoint
ALTER TABLE "follows" ALTER COLUMN "followee_id" SET DATA TYPE varchar(30);--> statement-breakpoint
ALTER TABLE "history" ALTER COLUMN "track_id" SET DATA TYPE varchar(30);--> statement-breakpoint
ALTER TABLE "history" ALTER COLUMN "user_id" SET DATA TYPE varchar(30);--> statement-breakpoint
ALTER TABLE "tracks" ALTER COLUMN "id" SET DATA TYPE varchar(30);--> statement-breakpoint
ALTER TABLE "tracks" ALTER COLUMN "album_id" SET DATA TYPE varchar(30);--> statement-breakpoint
ALTER TABLE "tracks" ALTER COLUMN "artist_id" SET DATA TYPE varchar(30);--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "id" SET DATA TYPE varchar(30);