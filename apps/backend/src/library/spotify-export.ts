export interface SpotifyExportEntry {
  ts: string;
  master_metadata_track_name: string | null;
  master_metadata_album_artist_name: string | null;
  master_metadata_album_album_name: string | null;
  spotify_track_uri: string | null;
  ms_played: number;
}

export function isValidEntry(entry: SpotifyExportEntry): boolean {
  return !!(
    entry.spotify_track_uri &&
    entry.ms_played >= 30_000 &&
    entry.master_metadata_track_name
  );
}

export function trackIdFromUri(uri: string): string | undefined {
  const parts = uri.split(":");
  return parts[2] || undefined;
}
