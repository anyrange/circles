import type {
  ExtendedAlbum,
  ExtendedArtist,
  Track,
  AudioFeature,
} from "@circles/types"

export function sanitizeAlbum(album: ExtendedAlbum) {
  const high = album.images.pop()?.url || ""
  const medium = album.images.pop()?.url || high
  const low = album.images.pop()?.url || medium

  return {
    data: {
      id: album.id,
      name: album.name,
      total_tracks: album.total_tracks,
      release_date: new Date(album.release_date),
      label: album.label,
      popularity: album.popularity,
      url: album.external_urls.spotify,
      release_date_precision: album.release_date_precision,
      album_type: album.album_type,
      genres: {
        connectOrCreate: album.genres.map((genre) => ({
          where: { name: genre },
          create: { name: genre },
        })),
      },
      Images: {
        create: { high, medium, low },
      },
    },
  }
}

export function sanitizeArtist(artist: ExtendedArtist) {
  const high = artist.images.pop()?.url || ""
  const medium = artist.images.pop()?.url || high
  const low = artist.images.pop()?.url || medium

  return {
    data: {
      id: artist.id,
      name: artist.name,
      followers: artist.followers.total,
      url: artist.external_urls.spotify,
      popularity: artist.popularity,
      genres: {
        connectOrCreate: artist.genres.map((genre) => ({
          where: { name: genre },
          create: { name: genre },
        })),
      },
      Images: {
        create: { high, medium, low },
      },
    },
  }
}

export function sanitizeTrack(track: Track) {
  const album = track.album

  const high = album.images.pop()?.url || ""
  const medium = album.images.pop()?.url || high
  const low = album.images.pop()?.url || medium

  return {
    data: {
      id: track.id,
      name: track.name,
      duration_ms: track.duration_ms,
      release_date: new Date(track.album.release_date),
      popularity: track.popularity,
      disc_number: track.disc_number,
      url: track.external_urls.spotify,
      preview_url: track.preview_url || "",
      track_number: track.track_number,
      is_local: track.is_local,
      explicit: track.explicit,
      Images: {
        create: { high, medium, low },
      },
      Album: {
        connect: {
          id: album.id,
        },
      },
      Artist: {
        connect: {
          id: track.artists[0].id,
        },
      },
    },
  }
}

export function sanitizeAudioFeatures(features: AudioFeature) {
  return {
    data: {
      track_id: features.id,
      acousticness: features.acousticness,
      dancebility: features.danceability,
      energy: features.energy,
      instrumentalness: features.instrumentalness,
      liveness: features.liveness,
      loudness: features.loudness,
      speechiness: features.speechiness,
      tempo: features.tempo,
      valence: features.valence,
    },
  }
}

export const selectImage = {
  select: {
    medium: true,
    low: true,
    high: true,
  },
} as const

export const selectArtistShort = {
  select: {
    url: true,
    popularity: true,
    name: true,
    id: true,
    followers: true,
  },
} as const

export const selectAlbumShort = {
  select: {
    name: true,
    label: true,
    release_date: true,
    release_date_precision: true,
    url: true,
    total_tracks: true,
    popularity: true,
    id: true,
    album_type: true,
  },
} as const

export const selectAlbum = {
  select: { ...selectAlbumShort.select, Images: selectImage },
} as const

export const selectArtist = {
  select: { ...selectArtistShort.select, Images: selectImage },
} as const

export const selectTrackShort = {
  select: {
    is_local: true,
    url: true,
    track_number: true,
    release_date: true,
    preview_url: true,
    popularity: true,
    name: true,
    id: true,
    explicit: true,
    duration_ms: true,
    disc_number: true,
    Images: selectImage,
    Album: selectAlbumShort,
    Artist: selectArtistShort,
  },
} as const
