import {
  bigint,
  boolean,
  doublePrecision,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  unique,
  varchar,
} from "drizzle-orm/pg-core";

// better-auth: user table
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  spotifyId: varchar("spotify_id", { length: 255 }).unique(),
  username: varchar("username", { length: 50 }).unique(),
  isPublic: boolean("is_public").default(true).notNull(),
  bio: text("bio"),
  createdAt: timestamp("created_at", { mode: "date" }).notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull(),
});

// better-auth: session table
export const session = pgTable("session", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at", { mode: "date" }).notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull(),
});

// better-auth: account table (stores OAuth tokens)
export const account = pgTable("account", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at", { mode: "date" }),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { mode: "date" }),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at", { mode: "date" }).notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull(),
});

// better-auth: verification table
export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }),
  updatedAt: timestamp("updated_at", { mode: "date" }),
});

export const albums = pgTable("albums", {
  id: bigint("id", { mode: "string" }).primaryKey().generatedAlwaysAsIdentity(),
  spotifyId: varchar("spotify_id", { length: 255 }).notNull().unique(),
  name: varchar({ length: 500 }).notNull(),
  albumType: varchar("album_type", { length: 50 }),
  releaseDate: varchar("release_date", { length: 20 }),
  images: jsonb().$type<{ url: string; width: number; height: number }[]>(),
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
});

export const artists = pgTable("artists", {
  id: bigint("id", { mode: "string" }).primaryKey().generatedAlwaysAsIdentity(),
  spotifyId: varchar("spotify_id", { length: 255 }).notNull().unique(),
  name: varchar({ length: 500 }).notNull(),
  genres: jsonb().$type<string[]>(),
  images: jsonb().$type<{ url: string; width: number; height: number }[]>(),
  popularity: integer(),
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
});

export const tracks = pgTable("tracks", {
  id: bigint("id", { mode: "string" }).primaryKey().generatedAlwaysAsIdentity(),
  spotifyId: varchar("spotify_id", { length: 255 }).notNull().unique(),
  name: varchar({ length: 500 }).notNull(),
  durationMs: integer("duration_ms"),
  explicit: boolean(),
  popularity: integer(),
  albumId: bigint("album_id", { mode: "string" }).references(() => albums.id),
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
});

export const trackArtists = pgTable(
  "track_artists",
  {
    trackId: bigint("track_id", { mode: "string" })
      .references(() => tracks.id)
      .notNull(),
    artistId: bigint("artist_id", { mode: "string" })
      .references(() => artists.id)
      .notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.trackId, table.artistId] }),
    index("track_artists_artist_id_idx").on(table.artistId),
  ],
);

export const audioFeatures = pgTable("audio_features", {
  trackId: bigint("track_id", { mode: "string" })
    .primaryKey()
    .references(() => tracks.id),
  danceability: doublePrecision(),
  energy: doublePrecision(),
  key: integer(),
  loudness: doublePrecision(),
  mode: integer(),
  speechiness: doublePrecision(),
  acousticness: doublePrecision(),
  instrumentalness: doublePrecision(),
  liveness: doublePrecision(),
  valence: doublePrecision(),
  tempo: doublePrecision(),
  timeSignature: integer("time_signature"),
});

export const history = pgTable(
  "history",
  {
    id: bigint("id", { mode: "string" }).primaryKey().generatedAlwaysAsIdentity(),
    userId: text("user_id")
      .references(() => user.id)
      .notNull(),
    trackId: bigint("track_id", { mode: "string" })
      .references(() => tracks.id)
      .notNull(),
    playedAt: timestamp("played_at", { mode: "date" }).notNull(),
  },
  (table) => [
    unique("history_user_played_at_unique").on(table.userId, table.playedAt),
    index("history_user_id_idx").on(table.userId),
    index("history_track_id_idx").on(table.trackId),
    index("history_played_at_idx").on(table.playedAt),
    index("history_user_played_at_desc_idx").on(table.userId, table.playedAt),
  ],
);

export const follows = pgTable(
  "follows",
  {
    followerId: text("follower_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    followingId: text("following_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.followerId, t.followingId] }),
    index("follows_following_id_idx").on(t.followingId),
  ],
);

export const playlists = pgTable(
  "playlists",
  {
    id: bigint("id", { mode: "string" }).primaryKey().generatedAlwaysAsIdentity(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 500 }).notNull(),
    description: text("description"),
    isAuto: boolean("is_auto").default(false).notNull(),
    spotifyId: varchar("spotify_id", { length: 255 }),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => [index("playlists_user_id_idx").on(t.userId)],
);

export const playlistTracks = pgTable(
  "playlist_tracks",
  {
    playlistId: bigint("playlist_id", { mode: "string" })
      .notNull()
      .references(() => playlists.id, { onDelete: "cascade" }),
    trackId: bigint("track_id", { mode: "string" })
      .notNull()
      .references(() => tracks.id, { onDelete: "cascade" }),
    position: integer("position").notNull(),
    addedAt: timestamp("added_at", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => [primaryKey({ columns: [t.playlistId, t.trackId] })],
);

export const aiCache = pgTable(
  "ai_cache",
  {
    id: bigint("id", { mode: "string" }).primaryKey().generatedAlwaysAsIdentity(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    type: varchar("type", { length: 50 }).notNull(),
    bucket: varchar("bucket", { length: 20 }).notNull(),
    response: jsonb("response").notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => [unique().on(t.userId, t.type, t.bucket)],
);

export const importJobs = pgTable("import_jobs", {
  id: bigint("id", { mode: "string" }).primaryKey().generatedAlwaysAsIdentity(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  status: varchar("status", { length: 20 }).notNull().default("pending_upload"),
  s3Key: varchar("s3_key", { length: 500 }).notNull(),
  totalTracks: integer("total_tracks"),
  importedTracks: integer("imported_tracks"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  completedAt: timestamp("completed_at", { mode: "date" }),
});
