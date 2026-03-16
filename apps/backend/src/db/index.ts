import { AlbumModel } from "./models/album";
import { ArtistModel } from "./models/artist";
import { FollowsModel } from "./models/follows";
import { HistoryModel } from "./models/history";
import { PlaylistModel } from "./models/playlist";
import { TrackModel } from "./models/track";
import { UserModel } from "./models/user";

export const db = {
  user: new UserModel(),
  album: new AlbumModel(),
  artist: new ArtistModel(),
  track: new TrackModel(),
  history: new HistoryModel(),
  follows: new FollowsModel(),
  playlist: new PlaylistModel(),
};
