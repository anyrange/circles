import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import readline from "readline"
import {
  users,
  userSocials,
  albums,
  tracks,
  history,
  images,
  follows,
  artistsToGenres,
  artists,
  genres,
  audioFeatures,
} from "../schema"

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL must be defined in env")
  process.exit(1)
}

const terminal = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

const queryClient = postgres(process.env.DATABASE_URL)
const db = drizzle(queryClient)

terminal.question("Are you sure you want to flush all db? (y/n) ", (ans) => {
  terminal.close()

  if (ans.toLowerCase() !== "y") process.exit(0)

  db.transaction(async (tx) => {
    await tx.delete(follows)
    await tx.delete(audioFeatures)
    await tx.delete(history)
    await tx.delete(tracks)
    await tx.delete(artistsToGenres)
    await tx.delete(genres)
    await tx.delete(artists)
    await tx.delete(albums)
    await tx.delete(images)
    await tx.delete(userSocials)
    await tx.delete(users)
  })
    .then(() => console.log("Successfully flushed"))
    .catch((err) => console.log(err))
    .finally(() => process.exit(0))
})
