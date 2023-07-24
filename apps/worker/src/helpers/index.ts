import { controllers } from "../services/database"

import type { Item, HistoryRecord } from "@circles/types"
import type { EntitiesIds, StorageItem } from "../types"

export function extractEntitiesIds(items: Item[]) {
  const trackIds = items.map(({ track }) => track.id)
  const albumIds = items.map(({ track }) => track.album.id)
  const artistIds = items.flatMap(({ track }) => [
    ...track.artists.map((artist) => artist.id),
    ...track.album.artists.map((artist) => artist.id),
  ])

  return { trackIds, albumIds, artistIds }
}

export function createHistoryStorage() {
  const trackIdsAcc = new Set<string>([])
  const albumIdsAcc = new Set<string>([])
  const artistIdsAcc = new Set<string>([])

  const storage: {
    [key: EntitiesIds["userId"]]: StorageItem
  } = {}

  const initiateUser = (userId: string) => {
    storage[userId] = {
      token: "",
      history: [],
      trackIds: [],
      albumIds: [],
      artistIds: [],
    }
  }

  const addEntities = ({
    trackIds,
    albumIds,
    artistIds,
    userId,
  }: EntitiesIds) => {
    if (!storage[userId]) initiateUser(userId)

    trackIds.forEach((id) => {
      if (trackIdsAcc.has(id)) return

      trackIdsAcc.add(id)
      storage[userId].trackIds.push(id)
    })

    albumIds.forEach((id) => {
      if (albumIdsAcc.has(id)) return

      albumIdsAcc.add(id)
      storage[userId].albumIds.push(id)
    })

    artistIds.forEach((id) => {
      if (artistIdsAcc.has(id)) return

      artistIdsAcc.add(id)
      storage[userId].artistIds.push(id)
    })
  }

  const addHistory = (
    userId: string,
    history: HistoryRecord[],
    token: string
  ) => {
    if (!storage[userId]) initiateUser(userId)

    storage[userId].history.push(...history)
    storage[userId].token = token
  }

  const cleanEntityDuplicates = async () => {
    if (albumIdsAcc.size === 0 && artistIdsAcc.size === 0) return

    const uniqAlbums = [...albumIdsAcc]
    const uniqArtists = [...artistIdsAcc]

    const [albumIds, artistIds] = await Promise.all([
      controllers.album.filterExistingAlbumIds(uniqAlbums),
      controllers.artist.filterExistingArtistIds(uniqArtists),
    ])

    albumIdsAcc.clear()
    artistIdsAcc.clear()

    albumIds.forEach((id) => albumIdsAcc.add(id))
    artistIds.forEach((id) => artistIdsAcc.add(id))
  }

  const getEntitiesUpdates = () => {
    return Object.values(storage).map((fields) => ({
      token: fields.token,
      trackIds: fields.trackIds.filter((id) => trackIdsAcc.has(id)),
      albumIds: fields.albumIds.filter((id) => albumIdsAcc.has(id)),
      artistIds: fields.artistIds.filter((id) => artistIdsAcc.has(id)),
    }))
  }

  const getHistories = () => {
    return Object.entries(storage).map(([id, fields]) => ({
      userId: id,
      history: fields.history,
    }))
  }

  const clearStorage = () => {
    trackIdsAcc.clear()
    albumIdsAcc.clear()
    artistIdsAcc.clear()

    for (const userId in storage) initiateUser(userId)
  }

  return {
    addEntities,
    addHistory,
    cleanEntityDuplicates,
    getEntitiesUpdates,
    getHistories,
    clearStorage,
  }
}
