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
  ],
);
