import { call } from "../core"

import type {
  APIMeResponse,
  APIRecentlyPlayedResponse,
  APIAudioFeaturesResponse,
  APIAlbumsResponse,
  APIArtistsResponse,
  APITracksResponse,
  Cursors,
} from "@circles/types"

export function fetchMe(token: string) {
  return call<APIMeResponse>({ route: "me", token })
}

export function fetchRecentlyPlayed(
  token: string,
  limit = 10,
  cursors?: Partial<Cursors>
) {
  const beforeParam = cursors?.before ? `&before=${cursors.before}` : ""
  const afterParam = cursors?.after ? `&after=${cursors.after}` : ""
  return call<APIRecentlyPlayedResponse>({
    route: `me/player/recently-played?limit=${limit}${beforeParam}${afterParam}`,
    token,
  })
}

export function fetchAudioFeatures(token: string, ids: string[]) {
  return call<APIAudioFeaturesResponse>({
    route: `audio-features?ids=${ids.join(",")}`,
    token,
  })
}

export function fetchAlbums(token: string, ids: string[]) {
  return call<APIAlbumsResponse>({
    route: `albums?ids=${ids.join(",")}`,
    token,
  })
}

export function fetchArtists(token: string, ids: string[]) {
  return call<APIArtistsResponse>({
    route: `artists?ids=${ids.join(",")}`,
    token,
  })
}

export function fetchTracks(token: string, ids: string[]) {
  return call<APITracksResponse>({
    route: `tracks?ids=${ids.join(",")}`,
    token,
  })
}

export { fetchTokens } from "./fetchTokens"
