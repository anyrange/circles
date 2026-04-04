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

describe("isValidEntry", () => {
  test("accepts a fully valid entry", () => {
    expect(isValidEntry(entry())).toBe(true);
  });

  test("rejects null spotify_track_uri", () => {
    expect(isValidEntry(entry({ spotify_track_uri: null }))).toBe(false);
  });

  test("rejects null track name", () => {
    expect(isValidEntry(entry({ master_metadata_track_name: null }))).toBe(false);
  });

  test("rejects ms_played below 30s", () => {
    expect(isValidEntry(entry({ ms_played: 29_999 }))).toBe(false);
  });

  test("accepts ms_played exactly 30s", () => {
    expect(isValidEntry(entry({ ms_played: 30_000 }))).toBe(true);
  });

  test("rejects ms_played of 0", () => {
    expect(isValidEntry(entry({ ms_played: 0 }))).toBe(false);
  });
});

describe("trackIdFromUri", () => {
  test("extracts track id from spotify URI", () => {
    expect(trackIdFromUri("spotify:track:abc123")).toBe("abc123");
  });

  test("returns undefined for malformed URI with empty id segment", () => {
    expect(trackIdFromUri("spotify:track:")).toBeUndefined();
  });

  test("handles a realistic track id", () => {
    expect(trackIdFromUri("spotify:track:4iV5W9uYEdYUVa79Axb7Rh")).toBe("4iV5W9uYEdYUVa79Axb7Rh");
  });
});
