import { db } from "../db";

export async function buildListeningContext(userId: string): Promise<string> {
  const [topTracks, topArtists, extended] = await Promise.all([
    db.history.getTopTracks(userId, 10),
    db.history.getTopArtists(userId, 10),
    db.history.getExtendedStats(userId),
  ]);

  const topGenres = extended.topGenres.slice(0, 5).map((g) => g.genre);

  const context = {
    totalScrobbles: extended.totalScrobbles,
    totalListeningHours: Math.round(extended.totalListeningMs / 3_600_000),
    mainstreamScore: extended.mainstreamScore,
    topTracks: topTracks.map((t) => ({ name: t.track.name, plays: t.playCount })),
    topArtists: topArtists.map((a) => ({ name: a.artist.name, plays: a.playCount })),
    topGenres,
    audioFeatures: extended.audioFeatures,
  };

  return JSON.stringify(context);
}
