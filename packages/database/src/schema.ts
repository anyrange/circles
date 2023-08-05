import {
  pgTable,
  serial,
  text,
  varchar,
  pgEnum,
  boolean,
  timestamp,
  doublePrecision,
  integer,
  primaryKey,
} from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import { PostgresJsDatabase } from "drizzle-orm/postgres-js"

export const privacyEnum = pgEnum("privacy", ["public", "private"])

export const albumTypeEnum = pgEnum("album_type", [
  "album",
  "single",
  "compilation",
])

export const users = pgTable("users", {
  id: varchar("id", { length: 30 }).primaryKey(),
  display_name: text("display_name").notNull(),
  email: text("email").default("").notNull(),
  avatar: text("avatar").default("").notNull(),
  country: text("country").notNull(),
  privacy: privacyEnum("privacy").default("public").notNull(),
  filter_enabled: boolean("filter_enabled").notNull(),
  url: text("url").notNull(),
  product: text("product").notNull(),
  type: text("type").notNull(),

  access_token: text("access_token").notNull(),
  refresh_token: text("refresh_token").notNull(),
  is_active: boolean("refresh_is_valid").default(true).notNull(),
  last_login: timestamp("last_login").defaultNow().notNull(),
  registration_date: timestamp("registration_date").defaultNow().notNull(),
})

export const usersRelations = relations(users, ({ many }) => ({
  history: many(history),
  follows: many(follows),
  followed: many(follows),
}))

export const follows = pgTable("follows", {
  id: serial("id").primaryKey(),
  follower_id: varchar("follower_id", { length: 30 })
    .references(() => users.id)
    .notNull(),
  followee_id: varchar("followee_id", { length: 30 })
    .references(() => users.id)
    .notNull(),
})

export const followsRelations = relations(follows, ({ one }) => ({
  follower: one(users, {
    fields: [follows.follower_id],
    references: [users.id],
  }),
  followee: one(users, {
    fields: [follows.followee_id],
    references: [users.id],
  }),
}))

export const genres = pgTable("genres", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
})

export const genresRelations = relations(genres, ({ many }) => ({
  artistsToGenres: many(artistsToGenres),
}))

export const images = pgTable("images", {
  id: serial("id").primaryKey(),
  high: text("high").notNull(),
  medium: text("medium").notNull(),
  low: text("low").notNull(),
})

export const albums = pgTable("albums", {
  id: varchar("id", { length: 30 }).primaryKey(),
  name: text("name").notNull(),
  release_date: timestamp("release_date").notNull(),
  release_date_precision: text("release_date_precision").notNull(),
  label: text("label").notNull(),
  popularity: doublePrecision("popularity").notNull(),
  album_type: albumTypeEnum("album_type").notNull(),
  url: text("url").notNull(),
  total_tracks: integer("total_tracks").notNull(),
  images_id: integer("images_id")
    .references(() => images.id)
    .notNull(),
})

export const artists = pgTable("artists", {
  id: varchar("id", { length: 30 }).primaryKey(),
  name: text("name").notNull(),
  followers: doublePrecision("followers").notNull(),
  url: text("url").notNull(),
  popularity: doublePrecision("popularity").notNull(),
  images_id: integer("images_id")
    .references(() => images.id)
    .notNull(),
})

export const artistsRelations = relations(artists, ({ many }) => ({
  artistsToGenres: many(artistsToGenres),
}))

export const artistsToGenres = pgTable(
  "artists_to_genres",
  {
    artist_id: varchar("artist_id", { length: 30 })
      .references(() => artists.id)
      .notNull(),
    genre_id: integer("genre_id")
      .references(() => genres.id)
      .notNull(),
  },
  (table) => {
    return {
      id: primaryKey(table.artist_id, table.genre_id),
    }
  }
)

export const artistsToGenresRelations = relations(
  artistsToGenres,
  ({ one }) => ({
    genre: one(genres, {
      fields: [artistsToGenres.genre_id],
      references: [genres.id],
    }),
    artist: one(artists, {
      fields: [artistsToGenres.artist_id],
      references: [artists.id],
    }),
  })
)

export const tracks = pgTable("tracks", {
  id: varchar("id", { length: 30 }).primaryKey(),
  name: text("name").notNull(),
  duration_ms: integer("duration_ms").notNull(),
  release_date: timestamp("release_date").notNull(),
  popularity: doublePrecision("popularity").notNull(),
  track_number: integer("track_number").notNull(),
  disc_number: integer("disc_number").notNull(),
  preview_url: text("preview_url").default(""),
  url: text("url").notNull(),
  is_local: boolean("is_local").notNull(),
  explicit: boolean("explicit").notNull(),
  images_id: integer("images_id")
    .references(() => images.id)
    .notNull(),
  album_id: varchar("album_id", { length: 30 })
    .references(() => albums.id)
    .notNull(),
  artist_id: varchar("artist_id", { length: 30 })
    .references(() => artists.id)
    .notNull(),
})

export const tracksRelations = relations(tracks, ({ one, many }) => ({
  audioFeatures: one(audioFeatures, {
    fields: [tracks.id],
    references: [audioFeatures.track_id],
  }),
  history: many(history),
  album: one(albums, {
    fields: [tracks.album_id],
    references: [albums.id],
  }),
  artist: one(artists, {
    fields: [tracks.artist_id],
    references: [artists.id],
  }),
  images: one(images, {
    fields: [tracks.images_id],
    references: [images.id],
  }),
}))

export const audioFeatures = pgTable("audio_features", {
  track_id: varchar("id", { length: 30 })
    .primaryKey()
    .references(() => tracks.id),
  tempo: doublePrecision("tempo").notNull(),
  energy: doublePrecision("energy").notNull(),
  loudness: doublePrecision("loudness").notNull(),
  dancebility: doublePrecision("dancebility").notNull(),
  instrumentalness: doublePrecision("instrumentalness").notNull(),
  acousticness: doublePrecision("acousticness").notNull(),
  speechiness: doublePrecision("speechiness").notNull(),
  liveness: doublePrecision("liveness").notNull(),
  valence: doublePrecision("valence").notNull(),
})

export const history = pgTable("history", {
  id: serial("id").primaryKey(),
  played_at: timestamp("played_at").notNull(),
  track_id: varchar("track_id", { length: 30 })
    .references(() => tracks.id)
    .notNull(),
  user_id: varchar("user_id", { length: 30 })
    .references(() => users.id)
    .notNull(),
})

export const historyRelations = relations(history, ({ one }) => ({
  track: one(tracks, {
    fields: [history.track_id],
    references: [tracks.id],
  }),
  user: one(users, {
    fields: [history.user_id],
    references: [users.id],
  }),
}))

const schema = {
  privacyEnum,
  albumTypeEnum,
  users,
  usersRelations,
  follows,
  followsRelations,
  genres,
  genresRelations,
  images,
  albums,
  artists,
  artistsRelations,
  artistsToGenres,
  artistsToGenresRelations,
  tracks,
  tracksRelations,
  audioFeatures,
  history,
  historyRelations,
}

export type Schema = typeof schema
export type DB = PostgresJsDatabase<Schema>
