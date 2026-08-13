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

export const jwks = pgTable("jwks", {
  id: text("id").primaryKey(),
  publicKey: text("public_key").notNull(),
  privateKey: text("private_key").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).notNull(),
  expiresAt: timestamp("expires_at", { mode: "date" }),
});

export const oauthClient = pgTable("oauth_client", {
  id: text("id").primaryKey(),
  clientId: text("client_id").notNull().unique(),
  clientSecret: text("client_secret"),
  disabled: boolean("disabled").default(false),
  skipConsent: boolean("skip_consent"),
  enableEndSession: boolean("enable_end_session"),
  subjectType: text("subject_type"),
  scopes: text("scopes").array(),
  userId: text("user_id").references(() => user.id, { onDelete: "cascade" }),
  referenceId: text("reference_id"),
  createdAt: timestamp("created_at", { mode: "date" }),
  updatedAt: timestamp("updated_at", { mode: "date" }),
  name: text("name"),
  uri: text("uri"),
  icon: text("icon"),
  contacts: text("contacts").array(),
  tos: text("tos"),
  policy: text("policy"),
  softwareId: text("software_id"),
  softwareVersion: text("software_version"),
  softwareStatement: text("software_statement"),
  redirectUris: text("redirect_uris").array().notNull(),
  postLogoutRedirectUris: text("post_logout_redirect_uris").array(),
  tokenEndpointAuthMethod: text("token_endpoint_auth_method"),
  grantTypes: text("grant_types").array(),
  responseTypes: text("response_types").array(),
  public: boolean("public"),
  type: text("type"),
  requirePKCE: boolean("require_pkce"),
  metadata: jsonb("metadata"),
});

export const oauthRefreshToken = pgTable("oauth_refresh_token", {
  id: text("id").primaryKey(),
  token: text("token").notNull(),
  clientId: text("client_id")
    .notNull()
    .references(() => oauthClient.clientId, { onDelete: "cascade" }),
  sessionId: text("session_id").references(() => session.id, { onDelete: "set null" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  referenceId: text("reference_id"),
  expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).notNull(),
  revoked: timestamp("revoked", { mode: "date" }),
  authTime: timestamp("auth_time", { mode: "date" }),
  scopes: text("scopes").array().notNull(),
});

export const oauthAccessToken = pgTable("oauth_access_token", {
  id: text("id").primaryKey(),
  token: text("token").notNull().unique(),
  clientId: text("client_id")
    .notNull()
    .references(() => oauthClient.clientId, { onDelete: "cascade" }),
  sessionId: text("session_id").references(() => session.id, { onDelete: "set null" }),
  userId: text("user_id").references(() => user.id, { onDelete: "cascade" }),
  referenceId: text("reference_id"),
  refreshId: text("refresh_id").references(() => oauthRefreshToken.id, {
    onDelete: "cascade",
  }),
  expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).notNull(),
  scopes: text("scopes").array().notNull(),
});

export const oauthConsent = pgTable("oauth_consent", {
  id: text("id").primaryKey(),
  clientId: text("client_id")
    .notNull()
    .references(() => oauthClient.clientId, { onDelete: "cascade" }),
  userId: text("user_id").references(() => user.id, { onDelete: "cascade" }),
  referenceId: text("reference_id"),
  scopes: text("scopes").array().notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull(),
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
      .references(() => user.id, { onDelete: "cascade" })
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
