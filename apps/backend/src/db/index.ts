import { AlbumModel } from "./models/album";
import { ArtistModel } from "./models/artist";
import { HistoryModel } from "./models/history";
import { TrackModel } from "./models/track";
import { UserModel } from "./models/user";

export const db = {
  user: new UserModel(),
  album: new AlbumModel(),
  artist: new ArtistModel(),
  track: new TrackModel(),
  history: new HistoryModel(),
};
