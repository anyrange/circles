import type { User, Item, ExtendedAlbum, ExtendedArtist } from "./entities"
import type { AudioFeature } from "./utilitary"

export type APIMeResponse = User

export interface APIRecentlyPlayedResponse {
  items: Item[]
  next: string
  cursors: Cursors
  limit: number
  href: string
}

export interface APIAudioFeaturesResponse {
  audio_features: AudioFeature[]
}

export interface APIAlbumsResponse {
  albums: ExtendedAlbum[]
}

export interface APIArtistsResponse {
  artists: ExtendedArtist[]
}
