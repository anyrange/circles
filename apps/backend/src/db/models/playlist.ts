import { and, asc, eq } from "drizzle-orm";

import type { Database } from "../postgres";
import { playlistTracks, playlists, tracks } from "../postgres/schema";

export type Playlist = typeof playlists.$inferSelect;
export type NewPlaylist = typeof playlists.$inferInsert;

export class PlaylistModel {
  private readonly db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  async findByUser(userId: string) {
    return this.db.select().from(playlists).where(eq(playlists.userId, userId));
  }

  async findById(id: string, userId: string): Promise<Playlist | null> {
    const [row] = await this.db
      .select()
      .from(playlists)
      .where(and(eq(playlists.id, id), eq(playlists.userId, userId)))
      .limit(1);
    return row ?? null;
  }

  async create(data: { userId: string; name: string; description?: string }) {
    const [row] = await this.db
      .insert(playlists)
      .values({ userId: data.userId, name: data.name, description: data.description })
      .returning();
    return row!;
  }

  async delete(id: string, userId: string) {
    await this.db.delete(playlists).where(and(eq(playlists.id, id), eq(playlists.userId, userId)));
  }

  async getTracks(playlistId: string) {
    return this.db
      .select({
        position: playlistTracks.position,
        addedAt: playlistTracks.addedAt,
        track: {
          id: tracks.id,
          spotifyId: tracks.spotifyId,
          name: tracks.name,
          durationMs: tracks.durationMs,
          explicit: tracks.explicit,
        },
      })
      .from(playlistTracks)
      .innerJoin(tracks, eq(playlistTracks.trackId, tracks.id))
      .where(eq(playlistTracks.playlistId, playlistId))
      .orderBy(asc(playlistTracks.position));
  }

  async addTrack(playlistId: string, trackId: string, position?: number) {
    const pos =
      position ??
      (await (async () => {
        const [last] = await this.db
          .select({ pos: playlistTracks.position })
          .from(playlistTracks)
          .where(eq(playlistTracks.playlistId, playlistId))
          .orderBy(asc(playlistTracks.position))
          .limit(1);
        return (last?.pos ?? -1) + 1;
      })());

    await this.db
      .insert(playlistTracks)
      .values({ playlistId, trackId, position: pos })
      .onConflictDoNothing();
  }

  async removeTrack(playlistId: string, trackId: string) {
    await this.db
      .delete(playlistTracks)
      .where(and(eq(playlistTracks.playlistId, playlistId), eq(playlistTracks.trackId, trackId)));
  }

  async upsertAutoPlaylist(userId: string, name: string, trackIds: string[]): Promise<void> {
    // Find or create the auto playlist
    let [playlist] = await this.db
      .select()
      .from(playlists)
      .where(
        and(eq(playlists.userId, userId), eq(playlists.name, name), eq(playlists.isAuto, true)),
      )
      .limit(1);

    if (!playlist) {
      const [created] = await this.db
        .insert(playlists)
        .values({ userId, name, isAuto: true })
        .returning();
      playlist = created!;
    }

    // Replace all tracks
    await this.db.delete(playlistTracks).where(eq(playlistTracks.playlistId, playlist.id));

    if (trackIds.length > 0) {
      await this.db
        .insert(playlistTracks)
        .values(
          trackIds.map((trackId, position) => ({ playlistId: playlist.id, trackId, position })),
        );
    }

    await this.db
      .update(playlists)
      .set({ updatedAt: new Date() })
      .where(eq(playlists.id, playlist.id));
  }
}
