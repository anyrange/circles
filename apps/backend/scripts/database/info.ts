import { createPostgresClient } from "../../src/services/database/postgres";

if (!process.env.POSTGRES_URL) {
  console.error("POSTGRES_URL must be defined in env");
  process.exit(1);
}

const db = createPostgresClient(process.env.POSTGRES_URL);

const printInfo = async () => {
  const [usersNum, albumsNum, genresNum, artistsNum, tracksNum] =
    await Promise.all([
      db.user.count(),
      db.album.count(),
      db.genre.count(),
      db.artist.count(),
      db.track.count(),
    ]);

  console.log(`
Users: ${usersNum}
Albums: ${albumsNum}
Artists: ${artistsNum}
Tracks: ${tracksNum}
Genres: ${genresNum}
`);
};

printInfo()
  .then()
  .catch((err) => console.log(err))
  .finally(() => process.exit(0));
