import { controllers } from "../services/database"

import type { Item, HistoryRecord } from "@circles/types"
import type { EntitiesIds } from "../types"

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
  let history: HistoryRecord[] = []

  const addEntities = ({ trackIds, albumIds, artistIds }: EntitiesIds) => {
    trackIds.forEach((id) => trackIdsAcc.add(id))
    albumIds.forEach((id) => albumIdsAcc.add(id))
    artistIds.forEach((id) => artistIdsAcc.add(id))
  }

  const addHistory = (newData: HistoryRecord[]) => {
    history.push(...newData)
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
    // tracks pre-filtered during history collection
  }

  const getEntities = () => {
    return {
      trackIds: [...trackIdsAcc],
      albumIds: [...albumIdsAcc],
      artistIds: [...artistIdsAcc],
    }
  }

  const getHistory = () => {
    return history
  }

  const clearStorage = () => {
    trackIdsAcc.clear()
    albumIdsAcc.clear()
    artistIdsAcc.clear()
    history = []
  }

  return {
    addEntities,
    addHistory,
    cleanEntityDuplicates,
    getEntities,
    getHistory,
    clearStorage,
  }
}
