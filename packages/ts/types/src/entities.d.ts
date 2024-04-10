import type {
  Copyright,
  Cursors,
  ExternalUrls,
  Followers,
  Image,
} from "./utilitary"

export interface Artist {
  external_urls: ExternalUrls
  href: string
  id: string
  name: string
  type: string
  uri: string
}

export type ExtendedArtist = Artist & {
  followers: Followers
  genres: string[]
  images: Image[]
  popularity: number
}

export interface Album {
  album_type: "album" | "single"
  artists: Artist[]
  available_markets: string[]
  external_urls: ExternalUrls
  href: string
  id: string
  images: Image[]
  name: string
  release_date: string
  release_date_precision: string
  total_tracks: number
  type: string
  uri: string
}

export interface Track {
  album: Album
  artists: Artist[]
  available_markets: string[]
  disc_number: number
  duration_ms: number
  explicit: boolean
  external_urls: ExternalUrls
  href: string
  id: string
  is_local: boolean
  name: string
  popularity: number
  preview_url: string | null
  track_number: number
  type: string
  uri: string
}

export interface Item {
  track: Track
  played_at: Date
  context: null
}

type ShortTrack = Omit<Track, { album: Album; external_ids: ExternalIds }>

export interface AlbumTracks {
  href: string
  items: ShortTrack[]
  limit: number
  next: null
  offset: number
  previous: null
  total: number
}

export type ExtendedAlbum = Album & {
  copyrights: Copyright[]
  genres: string[]
  label: string
  popularity: number
  tracks: AlbumTracks
}
