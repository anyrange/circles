import { eq } from "drizzle-orm";

import { db } from "../../db";
import { db as drizzleDb } from "../../db/postgres";
import { account } from "../../db/postgres/schema";
import { sinceFromRange } from "../../lib/range";
import { logger } from "../../library/logger";
import { hatchet } from "../client";

export const generateWeeklyPlaylists = hatchet.workflow({
  name: "generate-weekly-playlists",
  on: { cron: "0 0 * * 1" },
});

generateWeeklyPlaylists.task({
  name: "run",
  fn: async () => {
    const accounts = await drizzleDb
      .select({ userId: account.userId })
      .from(account)
      .where(eq(account.providerId, "spotify"));

    const userIds = [...new Set(accounts.map((a) => a.userId))];

    logger.worker.info({ count: userIds.length }, "generating weekly playlists");

    for (const userId of userIds) {
      try {
        await generateForUser(userId);
      } catch (err) {
        logger.worker.warn({ err, userId }, "failed to generate playlists for user");
      }
    }

    logger.worker.info("weekly playlist generation complete");
  },
});

async function generateForUser(userId: string) {
  const since7d = sinceFromRange("7d");
  const since30d = sinceFromRange("30d");

  // Top tracks this week
  const topWeekly = await db.history.getTopTracks(userId, 10, since7d);

  if (topWeekly.length >= 5) {
    await db.playlist.upsertAutoPlaylist(
      userId,
      "Your top tracks this week",
      topWeekly.map((t) => t.track.id),
    );
  }

  // Throwback favorites: heavy plays >30d ago, not played in last 30d
  const allTimeTop = await db.history.getTopTracks(userId, 50);
  const recentTop = await db.history.getTopTracks(userId, 50, since30d);
  const recentIds = new Set(recentTop.map((t) => t.track.id));

  const throwbacks = allTimeTop.filter((t) => !recentIds.has(t.track.id)).slice(0, 10);

  if (throwbacks.length >= 5) {
    await db.playlist.upsertAutoPlaylist(
      userId,
      "Throwback favorites",
      throwbacks.map((t) => t.track.id),
    );
  }
}
