import { controllers } from "@circles/database"
import { splitArrayOnChunks } from "../utils"
import { API_DEFAULT_CAPACITY } from "../config"

import type { Item, HistoryRecord } from "@circles/types"
import type { EntitiesIds } from "../types"

export async function makeBatchRequests<
  F extends (ids: string[]) => ReturnType<F>
>(fn: F, ids: string[], chunkSize = API_DEFAULT_CAPACITY) {
  if (!ids.length) return []

  const results = await Promise.all(
    splitArrayOnChunks(ids, chunkSize).map((chunk) => fn(chunk))
  )

  return results.flat(1)
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

export async function removeStoredTracks(items: Item[]) {
  const tracks = items.map(({ track }) => track.id)

  const existingItems = new Set(await controllers.track.checkMany(tracks))

  return items.filter(({ track }) => !existingItems.has(track.id))
}

export async function removeStoredAlbums(albums: string[]) {
  const existingAlbums = new Set(await controllers.album.checkMany(albums))

  return albums.filter((album) => !existingAlbums.has(album))
}

export async function removeStoredArtists(artists: string[]) {
  const existingArtists = new Set(await controllers.artist.checkMany(artists))

  return artists.filter((artist) => !existingArtists.has(artist))
}

export function createHistoryStorage() {
  const trackIdsAcc: Set<string> = new Set([])
  const albumIdsAcc: Set<string> = new Set([])
  const artistIdsAcc: Set<string> = new Set([])

  const userHistoryAcc: {
    [key: string]: HistoryRecord[]
  } = {}

  const addEntities = ({ trackIds, albumIds, artistIds }: EntitiesIds) => {
    trackIds.forEach((track) => trackIdsAcc.add(track))
    albumIds.forEach((album) => albumIdsAcc.add(album))
    artistIds.forEach((artist) => artistIdsAcc.add(artist))
  }

  const addHistory = (userId: string, history: HistoryRecord[]) => {
    if (!userHistoryAcc[userId]) userHistoryAcc[userId] = history
    else userHistoryAcc[userId].push(...history)
  }

  const getEntities = async () => {
    const uniqAlbums = [...albumIdsAcc]
    const uniqArtists = [...artistIdsAcc]

    const [albumIds, artistIds] = await Promise.all([
      removeStoredAlbums(uniqAlbums),
      removeStoredArtists(uniqArtists),
    ])

    const trackIds = [...trackIdsAcc]

    return { trackIds, albumIds, artistIds }
  }

  const getHistories = () => {
    return Object.entries(userHistoryAcc).map(([id, history]) => ({
      userId: id,
      history,
    }))
  }

  const clearStorage = () => {
    trackIdsAcc.clear()
    albumIdsAcc.clear()
    artistIdsAcc.clear()

    for (const userId in userHistoryAcc) userHistoryAcc[userId] = []
  }

  return { addEntities, addHistory, getEntities, getHistories, clearStorage }
}
