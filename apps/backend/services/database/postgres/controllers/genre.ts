import { sql } from "drizzle-orm";
import { genres, type DB } from "../schema";

export const createGenreController = (db: DB) => {
  const count = async () => {
    return await db
      .select({ count: sql<number>`count(*)` })
      .from(genres)
      .then((res) => res[0].count);
  };

  return {
    count,
  };
};
