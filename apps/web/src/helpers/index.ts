import { SCOPES } from "~~/config"

import type { Item } from "@circles/types"

export const getRedirectURI = () => {
  const runtimeConfig = useRuntimeConfig()
  return `${runtimeConfig.public.appURL}/callback`
}

export const getOAuthURL = () => {
  const runtimeConfig = useRuntimeConfig()
  return `https://accounts.spotify.com/authorize?response_type=code&client_id=${
    runtimeConfig.public.spotifyClientId
  }&scope=${SCOPES.join(" ")}&redirect_uri=${getRedirectURI()}`
}

export async function extractEntitiesIds(items: Item[]) {
  const trackIds = items.map(({ track }) => track.id)
  const albumIds = items.map(({ track }) => track.album.id)
  const artistIds = items.flatMap(({ track }) => [
    ...track.artists.map((artist) => artist.id),
    ...track.album.artists.map((artist) => artist.id),
  ])

  return { trackIds, albumIds, artistIds }
}
