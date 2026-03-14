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
  user: {
    history: r.many.history(),
  },
}));
