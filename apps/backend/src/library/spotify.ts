import { SpotifyApi } from "@spotify/web-api-ts-sdk";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { config } from "../config";
import { db as drizzleDb } from "../db/postgres";
import { account } from "../db/postgres/schema";

export type { AccessToken } from "@spotify/web-api-ts-sdk";

const refreshTokenResponseSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string().optional(),
  expires_in: z.number(),
});

export function createSpotifyClient(accessToken: string) {
  return SpotifyApi.withAccessToken(config.spotify.clientId, {
    access_token: accessToken,
    token_type: "Bearer",
    expires_in: 3600,
    refresh_token: "",
  });
}

export function hasSpotifyScope(scope: string | null, requiredScope: string) {
  return new Set(scope?.split(/[\s,]+/).filter(Boolean)).has(requiredScope);
}

export async function refreshAccessToken(refreshToken: string): Promise<{
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}> {
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });

  const credentials = Buffer.from(
    `${config.spotify.clientId}:${config.spotify.clientSecret}`,
  ).toString("base64");

  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Spotify token refresh failed: ${text}`);
  }

  const data = refreshTokenResponseSchema.parse(await res.json());

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token ?? refreshToken,
    expiresIn: data.expires_in,
  };
}

/**
 * Refreshes the token if expiring within 60s and stores the updated tokens.
 * Returns the current valid access token.
 */
export async function refreshAndStoreToken(
  accountRow: typeof account.$inferSelect,
): Promise<string> {
  if (
    accountRow.accessToken &&
    accountRow.accessTokenExpiresAt &&
    accountRow.accessTokenExpiresAt.getTime() - Date.now() >= 60_000
  ) {
    return accountRow.accessToken;
  }

  if (!accountRow.refreshToken) throw new Error("Spotify account has no refresh token");
  const refreshed = await refreshAccessToken(accountRow.refreshToken);

  await drizzleDb
    .update(account)
    .set({
      accessToken: refreshed.accessToken,
      refreshToken: refreshed.refreshToken,
      accessTokenExpiresAt: new Date(Date.now() + refreshed.expiresIn * 1000),
      updatedAt: new Date(),
    })
    .where(eq(account.id, accountRow.id));

  return refreshed.accessToken;
}
