CREATE TABLE "saved_tracks" (
	"user_id" text,
	"track_id" bigint,
	"added_at" timestamp NOT NULL,
	CONSTRAINT "saved_tracks_pkey" PRIMARY KEY("user_id","track_id")
);
--> statement-breakpoint
ALTER TABLE "albums" ADD COLUMN "total_tracks" integer;--> statement-breakpoint
CREATE INDEX "saved_tracks_track_id_idx" ON "saved_tracks" ("track_id");--> statement-breakpoint
ALTER TABLE "saved_tracks" ADD CONSTRAINT "saved_tracks_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "saved_tracks" ADD CONSTRAINT "saved_tracks_track_id_tracks_id_fkey" FOREIGN KEY ("track_id") REFERENCES "tracks"("id") ON DELETE CASCADE;