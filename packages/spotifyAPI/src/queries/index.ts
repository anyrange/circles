import spotifyAPI from "../core/call"

import type {
  APIMeResponse,
  APIRecentlyPlayedResponse,
  APIAudioFeaturesResponse,
  APIAlbumsResponse,
  APIArtistsResponse,
  Cursors,
} from "@circles/types"

export { fetchTokens } from "./fetchTokens"
export function me(token: string) {
  return spotifyAPI<APIMeResponse>({ route: "me", token })
}

export function recentlyPlayed(
  token: string,
  limit = 10,
  cursors?: Partial<Cursors>
) {
  const beforeParam = cursors?.before ? `&before=${cursors.before}` : ""
  const afterParam = cursors?.after ? `&after=${cursors.after}` : ""
  return spotifyAPI<APIRecentlyPlayedResponse>({
    route: `me/player/recently-played?limit=${limit}${beforeParam}${afterParam}`,
    token,
  })
}

export function audioFeatures(token: string, ids: string[]) {
  return spotifyAPI<APIAudioFeaturesResponse>({
    route: `audio-features?ids=${ids.join(",")}`,
    token,
  })
}

export function albums(token: string, ids: string[]) {
  return spotifyAPI<APIAlbumsResponse>({
    route: `albums?ids=${ids.join(",")}`,
    token,
  })
}

export function artists(token: string, ids: string[]) {
  return spotifyAPI<APIArtistsResponse>({
    route: `artists?ids=${ids.join(",")}`,
    token,
  })
}
