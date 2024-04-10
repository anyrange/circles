import type { Item } from "@circles/types";
import { api, env } from "@/config";

export const getRedirectURI = () => {
  return `${env.APP_URL}/callback`;
};

export const getOAuthURL = () => {
  return `https://accounts.spotify.com/authorize?response_type=code&client_id=${env.SPOTIFY_CLIENT_ID}&scope=${api.SCOPES.join(" ")}&redirect_uri=${getRedirectURI()}`;
};

export function extractEntitiesIds(items: Item[]) {
  const trackIds = items.map(({ track }) => track.id);
  const albumIds = items.map(({ track }) => track.album.id);
  const artistIds = items.flatMap(({ track }) => [
    ...track.artists.map((artist) => artist.id),
    ...track.album.artists.map((artist) => artist.id),
  ]);

  return { trackIds, albumIds, artistIds };
}
