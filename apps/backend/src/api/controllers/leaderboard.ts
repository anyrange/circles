import { sql } from "drizzle-orm";
import { Hono } from "hono";

import { db as drizzleDb } from "../../db/postgres";
import { history } from "../../db/postgres/schema";

interface LeaderboardEntry {
  id: string;
  name: string;
  username: string | null;
  image: string | null;
  scrobbleCount: number;
}

interface CacheEntry {
  data: LeaderboardEntry[];
  expiresAt: number;
}

// In-memory cache with 5-min TTL — acceptable as pure cache state
const cache = new Map<string, CacheEntry>();

async function getLeaderboard(period: "week" | "all"): Promise<LeaderboardEntry[]> {
  const cacheKey = period;
  const cached = cache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  const since = period === "week" ? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) : null;

  const rows = await drizzleDb.execute<{
    id: string;
    name: string;
    username: string | null;
    image: string | null;
    scrobble_count: string;
  }>(sql`
    SELECT
      u.id, u.name, u.username, u.image,
      count(h.id)::int as scrobble_count
    FROM "user" u
    JOIN ${history} h ON u.id = h.user_id
    WHERE u.is_public = true
    ${since ? sql`AND h.played_at >= ${since}` : sql``}
    GROUP BY u.id, u.name, u.username, u.image
    ORDER BY scrobble_count DESC
    LIMIT 50
  `);

  const data = rows.rows.map((r) => ({
    id: r.id,
    name: r.name,
    username: r.username,
    image: r.image,
    scrobbleCount: Number(r.scrobble_count),
  }));

  cache.set(cacheKey, { data, expiresAt: Date.now() + 5 * 60 * 1000 });
  return data;
}

export const leaderboardController = new Hono().get("/leaderboard", async (ctx) => {
  const period = ctx.req.query("period") === "week" ? "week" : "all";
  const data = await getLeaderboard(period);
  return ctx.json({ leaderboard: data });
});
