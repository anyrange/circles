import { eq, desc, and, lt, sql, gte, lte } from "drizzle-orm"
import type { User, Tokens, HistoryRecord } from "@circles/types"
import {
  albums,
  artists,
  history,
  tracks,
  users,
  images,
  userSocials,
} from "../schema"
import type { DB } from "../schema"

type UserWithTokens = User & {
  access_token: Tokens["access_token"]
  refresh_token: Tokens["refresh_token"]
}

export const createUserController = (db: DB) => {
  const upsert = async (data: UserWithTokens) => {
    const changingInfo = {
      display_name: data.display_name,
      avatar: data.images[0].url || "",
      country: data.country,
      email: data.email,
      product: data.product,
      filter_enabled: data.explicit_content.filter_enabled,
      access_token: data.access_token,
      refresh_token: data.refresh_token,
    }

    return await db.transaction(async (tx) => {
      const user = await tx
        .insert(users)
        .values({
          id: data.id,
          ...changingInfo,
          type: data.type,
        })
        .onConflictDoUpdate({
          target: users.id,
          set: { ...changingInfo, last_login: new Date() },
        })
        .returning({
          id: users.id,
          display_name: users.display_name,
          avatar: users.avatar,
          country: users.country,
          email: users.email,
          product: users.product,
          filter_enabled: users.filter_enabled,
          type: users.type,
          privacy: users.privacy,
          last_login: users.last_login,
          registration_date: users.registration_date,
        })
        .then((item) => item[0])

      if (user.registration_date.getTime() === user.last_login.getTime())
        db.insert(userSocials)
          .values({
            user_id: data.id,
            spotify: data.external_urls.spotify,
          })
          .then()

      return user
    })
  }

  const getOne = async (id: User["id"]) => {
    return db.query.users.findFirst({
      where: eq(users.id, id),
      with: {
        socials: {
          columns: {
            twitter: true,
            spotify: true,
            youtube: true,
            telegram: true,
            apple: true,
          },
        },
      },
    })
  }

  const isPublic = async (id: User["id"]) => {
    const user = await db.query.users.findFirst({
      where: eq(users.id, id),
      columns: {
        privacy: true,
      },
    })

    if (!user) return null

    return user.privacy === "public"
  }

  const lastListened = async (id: User["id"]) => {
    const user = await db.query.users.findFirst({
      columns: { id: true },
      where: eq(users.id, id),
      with: {
        history: {
          limit: 1,
          orderBy: desc(history.played_at),
        },
      },
    })

    return user?.history[0] || undefined
  }

  const count = async () => {
    return await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .then((res) => res[0].count)
  }

  const getUserTokens = async (id: User["id"]) => {
    return db.query.users.findFirst({
      columns: { id: true, access_token: true },
      where: eq(users.id, id),
    })
  }

  const updateAccessToken = async (
    id: User["id"],
    access_token: Tokens["access_token"]
  ) => {
    return db
      .update(users)
      .set({
        access_token,
      })
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        access_token: users.access_token,
      })
  }

  const updateAccessTokens = async (
    usersList: {
      id: User["id"]
      access_token: Tokens["access_token"]
      is_active: boolean
    }[]
  ) => {
    if (!usersList.length) return []

    return db.transaction(async (tx) => {
      usersList.forEach(async ({ id, access_token, is_active }) => {
        await tx
          .update(users)
          .set({
            access_token,
            is_active,
          })
          .where(eq(users.id, id))
          .returning({
            id: users.id,
            access_token: users.access_token,
          })
      })
    })
  }

  const updateHistory = async (
    id: User["id"],
    listeningHistory: HistoryRecord[]
  ) => {
    if (!listeningHistory.length) return

    return db.insert(history).values(
      listeningHistory.map(({ played_at, track_id }) => ({
        user_id: id,
        played_at,
        track_id,
      }))
    )
  }

  const getHistory = async (
    id: User["id"],
    options = { limit: 10, cursor: 0 }
  ) => {
    const { limit, cursor } = options

    if (limit < 1) return []

    return db.query.history.findMany({
      columns: {
        id: true,
        track_id: true,
        played_at: true,
      },
      where: cursor
        ? and(eq(history.user_id, id), lt(history.id, cursor))
        : eq(history.user_id, id),
      orderBy: desc(history.played_at),
      limit,
      with: {
        track: {
          columns: {
            is_local: true,
            url: true,
            track_number: true,
            release_date: true,
            preview_url: true,
            popularity: true,
            name: true,
            id: true,
            explicit: true,
            duration_ms: true,
            disc_number: true,
          },
          with: {
            images: {
              columns: {
                id: false,
              },
            },
            album: {
              columns: {
                images_id: false,
              },
            },
            artist: {
              columns: {
                images_id: false,
              },
            },
          },
        },
      },
    })
  }

  const topTracks = async (
    id: User["id"],
    options: { limit: number; page: number; start?: Date; end?: Date } = {
      page: 1,
      limit: 10,
    }
  ) => {
    const { limit, page, start = new Date(0), end = new Date() } = options

    if (limit < 1) return []

    return db
      .select({
        count: sql<number>`count(${history.id})`,
        track_id: history.track_id,
        track: tracks,
      })
      .from(history)
      .where(
        and(
          gte(history.played_at, start),
          lte(history.played_at, end),
          eq(history.user_id, id)
        )
      )
      .groupBy(({ track_id }) => track_id)
      .having(({ count }) => count)
      .orderBy(({ count }) => count)
      .offset((page - 1) * limit)
      .limit(limit)
      .innerJoin(tracks, eq(history.track_id, tracks.id))
  }

  const topAlbums = async (
    id: User["id"],
    options: { limit: number; page: number; start?: Date; end?: Date } = {
      page: 1,
      limit: 10,
    }
  ) => {
    const { limit, page, start = new Date(0), end = new Date() } = options

    if (limit < 1) return []

    return db
      .select({
        count: sql<number>`count(${history.id})`,
        album: albums,
        images: images,
      })
      .from(history)
      .where(
        and(
          gte(history.played_at, start),
          lte(history.played_at, end),
          eq(history.user_id, id)
        )
      )
      .innerJoin(tracks, eq(history.track_id, tracks.id))
      .groupBy(({ album }) => album.id)
      .orderBy(({ count }) => count)
      .offset((page - 1) * limit)
      .limit(limit)
      .innerJoin(albums, eq(tracks.album_id, albums.id))
      .innerJoin(images, eq(albums.images_id, images.id))
  }

  const topArtists = async (
    id: User["id"],
    options: { limit: number; page: number; start?: Date; end?: Date } = {
      page: 1,
      limit: 10,
    }
  ) => {
    const { limit, page, start = new Date(0), end = new Date() } = options

    if (limit < 1) return []

    return db
      .select({
        count: sql<number>`count(${history.id})`,
        track_id: history.track_id,
        artist_id: tracks.artist_id,
        artist: artists,
      })
      .from(history)
      .where(
        and(
          gte(history.played_at, start),
          lte(history.played_at, end),
          eq(history.user_id, id)
        )
      )
      .innerJoin(tracks, eq(history.track_id, tracks.id))
      .groupBy(({ artist_id }) => artist_id)
      .having(({ count }) => count)
      .orderBy(({ count }) => count)
      .offset((page - 1) * limit)
      .limit(limit)
      .innerJoin(artists, eq(tracks.artist_id, artists.id))
  }

  const getFollowers = async (id: User["id"]) => {
    const user = await db.query.users.findFirst({
      where: eq(users.id, id),
      with: {
        followed: {
          with: {
            follower: {
              columns: {
                id: true,
                display_name: true,
                privacy: true,
                avatar: true,
                is_active: true,
                last_login: true,
              },
            },
          },
        },
      },
    })

    if (!user) return null

    return user.followed.map(({ follower }) => follower)
  }

  const getFollows = async (id: User["id"]) => {
    const user = await db.query.users.findFirst({
      where: eq(users.id, id),
      with: {
        follows: {
          with: {
            followee: {
              columns: {
                id: true,
                display_name: true,
                privacy: true,
                avatar: true,
                is_active: true,
                last_login: true,
              },
            },
          },
        },
      },
    })

    if (!user) return null

    return user.follows.map(({ followee }) => followee)
  }

  return {
    upsert,
    getOne,
    isPublic,
    count,
    lastListened,
    getUserTokens,
    updateAccessToken,
    updateAccessTokens,
    updateHistory,
    getHistory,
    topTracks,
    topAlbums,
    topArtists,
    getFollowers,
    getFollows,
  }
}
