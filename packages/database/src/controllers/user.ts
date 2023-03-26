import { prisma } from "../client"

import type { User, Tokens, HistoryRecord } from "@circles/types"

type UserWithTokens = User & {
  access_token: Tokens["access_token"]
  refresh_token: Tokens["refresh_token"]
}

export async function upsert(data: UserWithTokens) {
  const user = await prisma.user.upsert({
    where: { id: data.id },
    create: {
      id: data.id,
      display_name: data.display_name,
      avatar: data.images[0].url || "",
      country: data.country,
      email: data.email,
      url: data.external_urls.spotify,
      type: data.type,
      product: data.product,
      filter_enabled: data.explicit_content.filter_enabled,
      access_token: data.access_token,
      refresh_token: data.refresh_token,
    },
    update: {
      display_name: data.display_name,
      avatar: data.images[0].url || "",
      country: data.country,
      email: data.email,
      product: data.product,
      filter_enabled: data.explicit_content.filter_enabled,
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      last_login: new Date(),
    },
    select: {
      id: true,
      display_name: true,
      avatar: true,
      country: true,
      email: true,
      product: true,
      filter_enabled: true,
      url: true,
      type: true,
      privacy: true,
      last_login: true,
      registration_date: true,
    },
  })

  return user
}

export async function getOne(id: User["id"]) {
  const user = await prisma.user.findUnique({ where: { id } })

  return user
}

export async function lastListened(id: User["id"]) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      history: {
        orderBy: { played_at: "desc" },
        take: 1,
      },
    },
  })

  return user?.history[0] || undefined
}

export async function getUserTokens(id: User["id"]) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, access_token: true },
  })

  return user
}

export async function updateTokens(
  id: User["id"],
  access_token: Tokens["access_token"]
) {
  const user = await prisma.user.update({
    where: { id },
    data: { access_token },
    select: { id: true, access_token: true },
  })

  return user
}

export async function updateManyTokens(
  users: {
    id: User["id"]
    access_token: Tokens["access_token"]
    refresh_is_valid: boolean
  }[]
) {
  if (!users.length) return []

  const results = await prisma.$transaction(
    users.map(({ id, access_token, refresh_is_valid }) =>
      prisma.user.update({
        where: { id },
        data: { access_token, refresh_is_valid },
        select: { id: true, access_token: true },
      })
    )
  )

  return results
}

export async function updateHistory(id: User["id"], history: HistoryRecord[]) {
  if (!history.length) return []

  const user = await prisma.user.update({
    where: { id },
    data: { history: { createMany: { data: history } } },
    select: {
      history: { select: { track_id: true, played_at: true } },
      id: true,
    },
  })

  return user
}
