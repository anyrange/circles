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
