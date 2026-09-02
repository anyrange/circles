import { AlbumModel } from "./models/album";
import { ArtistModel } from "./models/artist";
import { FollowsModel } from "./models/follows";
import { HistoryModel } from "./models/history";
import { PlaylistModel } from "./models/playlist";
import { SavedTrackModel } from "./models/saved-track";
import { TrackModel } from "./models/track";
import { UserModel } from "./models/user";
import { db as postgresDb } from "./postgres";

export const db = {
  user: new UserModel(postgresDb),
  album: new AlbumModel(postgresDb),
  artist: new ArtistModel(postgresDb),
  track: new TrackModel(postgresDb),
  history: new HistoryModel(postgresDb),
  follows: new FollowsModel(postgresDb),
  playlist: new PlaylistModel(postgresDb),
  savedTrack: new SavedTrackModel(postgresDb),
};
