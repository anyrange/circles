import { describe, expect, test } from "vite-plus/test";

import { isValidEntry, trackIdFromUri, type SpotifyExportEntry } from "./spotify-export";

function entry(overrides: Partial<SpotifyExportEntry> = {}): SpotifyExportEntry {
  return {
    ts: "2024-01-01T00:00:00Z",
    master_metadata_track_name: "Track Name",
    master_metadata_album_artist_name: "Artist",
    master_metadata_album_album_name: "Album",
    spotify_track_uri: "spotify:track:abc123",
    ms_played: 60_000,
    ...overrides,
  };
}

describe("TC-EXPORT-FAIL-01 — isValidEntry rejects negative ms_played", () => {
  test("rejects ms_played of -1 (invalid play duration)", () => {
    expect(isValidEntry(entry({ ms_played: -1 }))).toBe(false);
  });
});

describe("TC-EXPORT-FAIL-02 — trackIdFromUri rejects URI with no colon segments", () => {
  test("returns undefined for non-URI string without colons", () => {
    expect(trackIdFromUri("notauri")).toBeUndefined();
  });
});

describe("TC-EXPORT-EDGE-01 — isValidEntry accepts null album_artist_name", () => {
  test("passes validation despite null album_artist_name (field is not required)", () => {
    expect(isValidEntry(entry({ master_metadata_album_artist_name: null }))).toBe(true);
  });
});

describe("TC-EXPORT-EDGE-02 — trackIdFromUri with empty string", () => {
  test("returns undefined for empty string input", () => {
    expect(trackIdFromUri("")).toBeUndefined();
  });
});

describe("TC-EXPORT-EDGE-03 — trackIdFromUri with special characters in track ID", () => {
  test("handles realistic Base-62 Spotify track ID with mixed case and digits", () => {
    expect(trackIdFromUri("spotify:track:4iV5W9uYEdYUVa79Axb7Rh")).toBe("4iV5W9uYEdYUVa79Axb7Rh");
  });
});

describe("TC-EXPORT-INVAL-01 — trackIdFromUri with non-standard URI type", () => {
  test("extracts ID segment from episode URI (not a track — reveals permissive parser)", () => {
    expect(trackIdFromUri("spotify:episode:xyz789")).toBe("xyz789");
  });
});
