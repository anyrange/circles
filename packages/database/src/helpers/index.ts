import type {
  ExtendedAlbum,
  ExtendedArtist,
  Album,
  Track,
  AudioFeature,
} from "@circles/types"
import { getTableColumns } from "drizzle-orm"
import { albums, artists, images, tracks } from "../schema"

export function extractImages(entity: Album | ExtendedAlbum | ExtendedArtist) {
  const high = entity.images.pop()?.url || ""
  const medium = entity.images.pop()?.url || high
  const low = entity.images.pop()?.url || medium

  return { high, medium, low }
}

export function formatAlbum(album: ExtendedAlbum) {
  return {
    id: album.id,
    name: album.name,
    total_tracks: album.total_tracks,
    label: album.label,
    popularity: album.popularity,
    url: album.external_urls.spotify,
    release_date: new Date(album.release_date),
    release_date_precision: album.release_date_precision,
    album_type: album.album_type,
  }
}

export function formatArtist(artist: ExtendedArtist) {
  return {
    id: artist.id,
    name: artist.name,
    followers: artist.followers.total,
    url: artist.external_urls.spotify,
    popularity: artist.popularity,
  }
}

export function formatTrack(track: Track) {
  return {
    id: track.id,
    name: track.name,
    duration_ms: track.duration_ms,
    release_date: new Date(track.album.release_date),
    popularity: track.popularity,
    disc_number: track.disc_number,
    url: track.external_urls.spotify,
    preview_url: track.preview_url,
    track_number: track.track_number,
    is_local: track.is_local,
    explicit: track.explicit,
    album_id: track.album.id,
    artist_id: track.artists[0].id,
  }
}

export function formatAudioFeatures(features: AudioFeature) {
  return {
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
  }
}
