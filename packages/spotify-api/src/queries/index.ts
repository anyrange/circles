import { call } from "../core"
import { makeBatchedRequest } from "../helpers"
import { API_ALBUM_CAPACITY } from "../config"

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
  const request = async (idsBatch: string[]) =>
    call<APIAudioFeaturesResponse>({
      route: `audio-features?ids=${idsBatch.join(",")}`,
      token,
    }).then(({ audio_features }) => audio_features)

  const batchedRequest = makeBatchedRequest(request, ids)

  return batchedRequest
}

export function fetchAlbums(token: string, ids: string[]) {
  const request = async (idsBatch: string[]) =>
    call<APIAlbumsResponse>({
      route: `albums?ids=${idsBatch.join(",")}`,
      token,
    }).then(({ albums }) => albums)

  const batchedRequest = makeBatchedRequest(request, ids, API_ALBUM_CAPACITY)

  return batchedRequest
}

export function fetchArtists(token: string, ids: string[]) {
  const request = async (idsBatch: string[]) =>
    call<APIArtistsResponse>({
      route: `artists?ids=${idsBatch.join(",")}`,
      token,
    }).then(({ artists }) => artists)

  const batchedRequest = makeBatchedRequest(request, ids)

  return batchedRequest
}

export function fetchTracks(token: string, ids: string[]) {
  const request = async (idsBatch: string[]) =>
    call<APITracksResponse>({
      route: `tracks?ids=${idsBatch.join(",")}`,
      token,
    }).then(({ tracks }) => tracks)

  const batchedRequest = makeBatchedRequest(request, ids)

  return batchedRequest
}

export { fetchTokens } from "./fetchTokens"

type EntitiesIds = {
  trackIds: string[]
  albumIds: string[]
  artistIds: string[]
}

export async function fetchEntities(
  token: string,
  { trackIds, albumIds, artistIds }: EntitiesIds
) {
  const [features, tracks, albums, artists] = await Promise.all([
    fetchAudioFeatures(token, trackIds),
    fetchTracks(token, trackIds),
    fetchAlbums(token, albumIds),
    fetchArtists(token, artistIds),
  ])

  return { features, tracks, albums, artists }
}
