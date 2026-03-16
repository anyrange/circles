import { and, eq, lt } from "drizzle-orm";

import { db as drizzleDb } from "../../db/postgres";
import { account } from "../../db/postgres/schema";
import { logger } from "../../library/logger";
import { refreshAndStoreToken } from "../../library/spotify";
import { hatchet } from "../client";

export const refreshTokens = hatchet.workflow({
  name: "refresh-tokens",
  on: { cron: "*/30 * * * *" },
});

refreshTokens.task({
  name: "run",
  fn: async () => {
    const tenMinutesFromNow = new Date(Date.now() + 10 * 60 * 1000);

    const accounts = await drizzleDb
      .select()
      .from(account)
      .where(
        and(eq(account.providerId, "spotify"), lt(account.accessTokenExpiresAt, tenMinutesFromNow)),
      );

    logger.worker.info({ count: accounts.length }, "refreshing tokens");

    for (let i = 0; i < accounts.length; i += 100) {
      const batch = accounts.slice(i, i + 100);
      await Promise.allSettled(
        batch.map(async (acc) => {
          try {
            await refreshAndStoreToken(acc);
          } catch (err) {
            logger.worker.warn({ err, accountId: acc.id }, "failed to refresh token");
          }
        }),
      );
    }

    logger.worker.info("token refresh complete");
  },
});
