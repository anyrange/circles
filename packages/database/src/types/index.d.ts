import type {
  AudioFeature,
  ExtendedAlbum,
  ExtendedArtist,
  Track,
  User,
  HistoryRecord,
} from "@circles/types"

export interface UpdateInfo {
  albums: ExtendedAlbum[]
  artists: ExtendedArtist[]
  tracks: Track[]
  features: AudioFeature[]
  histories: {
    userId: User["id"]
    history: HistoryRecord[]
  }[]
}
