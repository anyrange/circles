export interface ExplicitContent {
  filter_enabled: boolean
  filter_locked: boolean
}

export interface ExternalUrls {
  spotify: string
}

export interface Followers {
  href: null
  total: number
}

export interface Image {
  height: null
  url: string
  width: null
}

interface APIMeResponse {
  country: string
  display_name: string
  email: string
  explicit_content: ExplicitContent
  external_urls: ExternalUrls
  followers: Followers
  href: string
  id: string
  images: Image[]
  product: string
  type: string
  uri: string
}
