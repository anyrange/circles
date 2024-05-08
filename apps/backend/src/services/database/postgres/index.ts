import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import {
  createUserController,
  createTrackController,
  createAlbumController,
  createArtistController,
  createAudioFeaturesController,
  createGeneralController,
  createGenreController,
} from "./controllers";

export const createPostgresClient = (connectionString: string) => {
  const queryClient = postgres(connectionString);
  const db = drizzle(queryClient, { schema });

  return {
    user: createUserController(db),
    album: createAlbumController(db),
    artist: createArtistController(db),
    track: createTrackController(db),
    audioFeatures: createAudioFeaturesController(db),
    general: createGeneralController(db),
    genre: createGenreController(db),
  };
};
