import { createDBClient } from ".."

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL must be defined in env")
  process.exit(1)
}

const db = createDBClient(process.env.DATABASE_URL)

const printInfo = async () => {
  const [usersNum, albumsNum, genresNum, artistsNum, tracksNum] =
    await Promise.all([
      db.user.count(),
      db.album.count(),
      db.genre.count(),
      db.artist.count(),
      db.track.count(),
    ])

  console.log(`
Users: ${usersNum}
Albums: ${albumsNum}
Artists: ${artistsNum}
Tracks: ${tracksNum}
Genres: ${genresNum}
`)
}

printInfo().then()
