import { eq } from "drizzle-orm";

import { db as drizzleDb } from "../../db/postgres";
import { account } from "../../db/postgres/schema";
import { logger } from "../../library/logger";
import { hasSpotifyScope } from "../../library/spotify";
import { hatchet } from "../client";
import { syncHistory } from "./sync-history";
import { syncSavedTracks } from "./sync-saved-tracks";

export const syncAllUsers = hatchet.workflow({
  name: "sync-all-users",
  on: { cron: "*/15 * * * *" },
});

syncAllUsers.task({
  name: "run",
  fn: async () => {
    const accounts = await drizzleDb
      .select({ userId: account.userId, scope: account.scope })
      .from(account)
      .where(eq(account.providerId, "spotify"));

    const userIds = [...new Set(accounts.map((a) => a.userId))];

    logger.worker.info({ count: userIds.length }, "syncing all users");

    for (const userId of userIds) {
      await syncHistory.runNoWait({ userId });
      const spotifyAccount = accounts.find((item) => item.userId === userId);
      if (hasSpotifyScope(spotifyAccount?.scope ?? null, "user-library-read")) {
        await syncSavedTracks.runNoWait({ userId });
      }
    }
  },
});
