import { eq } from "drizzle-orm";

import type { Database } from "../postgres";
import { savedTracks } from "../postgres/schema";

export type NewSavedTrack = typeof savedTracks.$inferInsert;

export class SavedTrackModel {
  private readonly db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  async replaceForUser(userId: string, data: NewSavedTrack[]) {
    await this.db.transaction(async (tx) => {
      await tx.delete(savedTracks).where(eq(savedTracks.userId, userId));
      // Keep each insert comfortably below PostgreSQL's parameter limit for large libraries.
      for (let offset = 0; offset < data.length; offset += 5_000) {
        await tx.insert(savedTracks).values(data.slice(offset, offset + 5_000));
      }
    });
  }
}
