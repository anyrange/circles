export interface ExplicitContent {
  filter_enabled: boolean
  filter_locked: boolean
}

export interface ExternalUrls {
  spotify: string
}

export interface Followers {
  href: string | null
  total: number
}

export interface Image {
  height: number | null
  url: string
  width: number | null
}

export interface Copyright {
  text: string
  type: string
}

export interface Cursors {
  after: string
  before: string
}

export interface AudioFeature {
  danceability: number
  energy: number
  key: number
  loudness: number
  mode: number
  speechiness: number
  acousticness: number
  instrumentalness: number
  liveness: number
  valence: number
  tempo: number
  type: string
  id: string
  uri: string
  track_href: string
  analysis_url: string
  duration_ms: number
  time_signature: number
}
