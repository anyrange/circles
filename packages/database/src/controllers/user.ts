import prisma from "../client"
import { User } from "@circles/types"

export async function upsertUser(data: User) {
  const user = await prisma.user.upsert({
    where: { id: data.id },
    create: {
      id: data.id,
      username: data.username,
      avatar: data.avatar,
      country: data.country,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      email: data.email,
    },
    update: {
      username: data.username,
      avatar: data.avatar,
      country: data.country,
      email: data.email,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      lastLogin: new Date(),
    },
  })
  return user
}

export async function getUser(id: User["id"]) {
  const user = await prisma.user.findUnique({ where: { id } })
  return user
}
