import { desc, eq } from "drizzle-orm";
import { history, type DB } from "../schema";
import type {
  AudioFeature,
  ExtendedAlbum,
  ExtendedArtist,
  Track,
  User,
  HistoryRecord,
} from "@/types";

import { createAlbumController } from "./album";
import { createArtistController } from "./artist";
import { createTrackController } from "./track";
import { createAudioFeaturesController } from "./audioFeatures";
import { createUserController } from "./user";

type UpdateInfo = {
  userId: User["id"];
  history: HistoryRecord[];
  albums: ExtendedAlbum[];
  artists: ExtendedArtist[];
  tracks: Track[];
  features: AudioFeature[];
};

export const createGeneralController = (db: DB) => {
  const getUsersInfo = async () => {
    const usersList = await db.query.users.findMany({
      columns: {
        id: true,
        access_token: true,
        refresh_token: true,
      },
      with: {
        history: {
          limit: 1,
          orderBy: desc(history.played_at),
        },
      },
      where: (users) => eq(users.is_active, true),
    });

    return usersList.map((user) => ({
      id: user.id,
      refresh_token: user.refresh_token,
      access_token: user.access_token,
      lastHistoryRecord: user.history[0] || undefined,
    }));
  };

  const updateDatabase = async (data: UpdateInfo) => {
    const isEmpty = !(
      data.albums.length ||
      data.artists.length ||
      data.tracks.length ||
      data.features.length ||
      data.history.length
    );

    if (isEmpty) {
      return;
    }

    return db.transaction(async (tx) => {
      await createAlbumController(tx).createMany(data.albums);
      await createArtistController(tx).createMany(data.artists);
      await createTrackController(tx).createMany(data.tracks);
      await createAudioFeaturesController(tx).createMany(data.features);
      await createUserController(tx).updateHistory(data.userId, data.history);
    });
  };

  return {
    getUsersInfo,
    updateDatabase,
  };
};
