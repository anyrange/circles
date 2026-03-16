import { and, eq } from "drizzle-orm";

import { db } from "../db";
import { db as drizzleDb } from "../db/postgres";
import { account } from "../db/postgres/schema";
import { logger } from "../library/logger";
import { createSpotifyClient, refreshAndStoreToken } from "../library/spotify";

type SpotifyClient = ReturnType<typeof createSpotifyClient>;

type ArtistImage = { url: string; width: number; height: number };

export type HydratedArtist = {
  spotifyId: string;
  name: string;
  genres: string[] | null;
  images: ArtistImage[] | null;
  popularity: number | null;
};

export async function fetchHydratedArtists(
  spotify: SpotifyClient,
  artistsToHydrate: { id: string; name: string }[],
) {
  const uniqueArtists = Object.values(
    Object.fromEntries(
      artistsToHydrate.filter((artist) => artist.id).map((artist) => [artist.id, artist]),
    ),
  );

  const hydrated = new Map<string, Omit<HydratedArtist, "name" | "spotifyId">>();

  for (let i = 0; i < uniqueArtists.length; i += 50) {
    const batch = uniqueArtists.slice(i, i + 50);

    try {
      const fullArtists = await spotify.artists.get(batch.map((artist) => artist.id));
      for (const artist of fullArtists) {
        hydrated.set(artist.id, {
          images: artist.images ?? null,
          genres: artist.genres ?? null,
          popularity: artist.popularity ?? null,
        });
      }
      continue;
    } catch (err) {
      logger.worker.warn(
        {
          err,
          artistIds: batch.map((artist) => artist.id),
        },
        "failed to fetch artist batch, retrying individually",
      );
    }

    for (const artist of batch) {
      try {
        const fullArtist = await spotify.artists.get(artist.id);
        hydrated.set(artist.id, {
          images: fullArtist.images ?? null,
          genres: fullArtist.genres ?? null,
          popularity: fullArtist.popularity ?? null,
        });
      } catch (err) {
        logger.worker.warn({ err, artistId: artist.id }, "failed to fetch artist details");
      }
    }
  }

  return uniqueArtists.map((artist) => {
    const full = hydrated.get(artist.id);
    return {
      spotifyId: artist.id,
      name: artist.name,
      genres: full?.genres ?? null,
      images: full?.images ?? null,
      popularity: full?.popularity ?? null,
    } satisfies HydratedArtist;
  });
}

export async function hydrateAndStoreArtistsForUser(
  userId: string,
  artistsToHydrate: { id: string; name: string }[],
) {
  if (artistsToHydrate.length === 0) {
    return [];
  }

  const [spotifyAccount] = await drizzleDb
    .select()
    .from(account)
    .where(and(eq(account.userId, userId), eq(account.providerId, "spotify")))
    .limit(1);

  if (!spotifyAccount) {
    logger.worker.warn({ userId }, "spotify account not found for artist hydration");
    return [];
  }

  const accessToken = await refreshAndStoreToken(spotifyAccount);
  const spotify = createSpotifyClient(accessToken);
  const hydratedArtists = await fetchHydratedArtists(spotify, artistsToHydrate);

  await db.artist.upsertMany(hydratedArtists);

  return hydratedArtists;
}
