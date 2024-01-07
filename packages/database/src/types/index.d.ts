import type {
  AudioFeature,
  ExtendedAlbum,
  ExtendedArtist,
  Track,
  User,
  HistoryRecord,
} from "@circles/types"

export interface UpdateInfo {
  userId: User["id"]
  history: HistoryRecord[]
  albums: ExtendedAlbum[]
  artists: ExtendedArtist[]
  tracks: Track[]
  features: AudioFeature[]
}
