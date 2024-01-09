import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import * as schema from "./schema"

import { createUserController } from "./controllers/user"
import { createTrackController } from "./controllers/track"
import { createAlbumController } from "./controllers/album"
import { createArtistController } from "./controllers/artist"
import { createAudioFeaturesController } from "./controllers/audioFeatures"
import { createGeneralController } from "./controllers/general"
import { createGenreController } from "./controllers/genre"

export const createPostgresClient = (connectionString: string) => {
  const queryClient = postgres(connectionString)
  const db = drizzle(queryClient, { schema })

  return {
    user: createUserController(db),
    album: createAlbumController(db),
    artist: createArtistController(db),
    track: createTrackController(db),
    audioFeatures: createAudioFeaturesController(db),
    general: createGeneralController(db),
    genre: createGenreController(db),
  }
}
