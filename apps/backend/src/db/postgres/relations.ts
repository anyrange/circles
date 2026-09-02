import { defineRelations } from "drizzle-orm";

import * as schema from "./schema";

export const relations = defineRelations(schema, (r) => ({
  tracks: {
    album: r.one.albums({
      from: r.tracks.albumId,
      to: r.albums.id,
    }),
    trackArtists: r.many.trackArtists(),
    audioFeatures: r.one.audioFeatures({
      from: r.tracks.id,
      to: r.audioFeatures.trackId,
    }),
    playlistTracks: r.many.playlistTracks(),
    savedTracks: r.many.savedTracks(),
  },
  albums: {
    tracks: r.many.tracks(),
  },
  artists: {
    trackArtists: r.many.trackArtists(),
  },
  trackArtists: {
    track: r.one.tracks({
      from: r.trackArtists.trackId,
      to: r.tracks.id,
    }),
    artist: r.one.artists({
      from: r.trackArtists.artistId,
      to: r.artists.id,
    }),
  },
  audioFeatures: {
    track: r.one.tracks({
      from: r.audioFeatures.trackId,
      to: r.tracks.id,
    }),
  },
  history: {
    user: r.one.user({
      from: r.history.userId,
      to: r.user.id,
    }),
    track: r.one.tracks({
      from: r.history.trackId,
      to: r.tracks.id,
    }),
  },
  savedTracks: {
    user: r.one.user({
      from: r.savedTracks.userId,
      to: r.user.id,
    }),
    track: r.one.tracks({
      from: r.savedTracks.trackId,
      to: r.tracks.id,
    }),
  },
  user: {
    history: r.many.history(),
    playlists: r.many.playlists(),
    savedTracks: r.many.savedTracks(),
  },
  playlists: {
    user: r.one.user({
      from: r.playlists.userId,
      to: r.user.id,
    }),
    playlistTracks: r.many.playlistTracks(),
  },
  playlistTracks: {
    playlist: r.one.playlists({
      from: r.playlistTracks.playlistId,
      to: r.playlists.id,
    }),
    track: r.one.tracks({
      from: r.playlistTracks.trackId,
      to: r.tracks.id,
    }),
  },
}));
