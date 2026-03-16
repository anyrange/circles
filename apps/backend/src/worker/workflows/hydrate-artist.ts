import type { JsonObject } from "@hatchet-dev/typescript-sdk";
import { and, eq } from "drizzle-orm";

import { db } from "../../db";
import { db as drizzleDb } from "../../db/postgres";
import { account } from "../../db/postgres/schema";
import { fetchHydratedArtists } from "../../lib/spotify-artists";
import { logger } from "../../library/logger";
import { createSpotifyClient, refreshAndStoreToken } from "../../library/spotify";
import { hatchet } from "../client";

interface Input extends JsonObject {
  userId: string;
  artistId: string;
}

export const hydrateArtist = hatchet.workflow<Input>({
  name: "hydrate-artist",
});

hydrateArtist.task({
  name: "fetch-and-store",
  fn: async (input) => {
    const { userId, artistId } = input;

    const detail = await db.artist.findDetailForUser(userId, artistId);
    if (!detail) {
      logger.worker.warn({ artistId, userId }, "artist not found for hydration");
      return;
    }

    const { artist } = detail;
    if (artist.images !== null || artist.genres !== null || artist.popularity !== null) {
      return;
    }

    const [spotifyAccount] = await drizzleDb
      .select()
      .from(account)
      .where(and(eq(account.userId, userId), eq(account.providerId, "spotify")))
      .limit(1);

    if (!spotifyAccount) {
      logger.worker.warn({ artistId, userId }, "spotify account not found for artist hydration");
      return;
    }

    const accessToken = await refreshAndStoreToken(spotifyAccount);
    const spotify = createSpotifyClient(accessToken);
    const [hydratedArtist] = await fetchHydratedArtists(spotify, [
      {
        id: artist.spotifyId,
        name: artist.name,
      },
    ]);

    if (!hydratedArtist) {
      logger.worker.warn({ artistId, userId }, "artist hydration returned no payload");
      return;
    }

    await db.artist.upsertMany([hydratedArtist]);
    logger.worker.info({ artistId, userId }, "artist hydrated");
  },
});
