import { zipSync } from "fflate";
import { describe, expect, test } from "vite-plus/test";

import {
  MAX_IMPORT_BYTES,
  MAX_IMPORT_ENTRIES,
  parseSpotifyImport,
  splitIntoBatches,
} from "./import-parser";
import type { SpotifyExportEntry } from "./spotify-export";

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

describe("parseSpotifyImport", () => {
  test("parses valid JSON entries", () => {
    const bytes = new TextEncoder().encode(JSON.stringify([entry(), entry({ ms_played: 1 })]));

    expect(parseSpotifyImport(bytes)).toEqual([entry()]);
  });

  test("parses valid zip entries from multiple JSON files", () => {
    const zip = zipSync({
      "part-1.json": new TextEncoder().encode(
        JSON.stringify([entry({ spotify_track_uri: "spotify:track:a" })]),
      ),
      "part-2.json": new TextEncoder().encode(
        JSON.stringify([entry({ spotify_track_uri: "spotify:track:b" })]),
      ),
      "readme.txt": new TextEncoder().encode("ignored"),
    });

    expect(parseSpotifyImport(zip).map((item) => item.spotify_track_uri)).toEqual([
      "spotify:track:a",
      "spotify:track:b",
    ]);
  });

  test("rejects files above the import byte limit", () => {
    expect(() => parseSpotifyImport(new Uint8Array(MAX_IMPORT_BYTES + 1))).toThrow(
      "Import file is too large",
    );
  });

  test("rejects too many entries", () => {
    const entries = Array.from({ length: MAX_IMPORT_ENTRIES + 1 }, (_, index) =>
      entry({ spotify_track_uri: `spotify:track:${index}` }),
    );
    const bytes = zipSync({
      "streaming-history.json": new TextEncoder().encode(JSON.stringify(entries)),
    });

    expect(() => parseSpotifyImport(bytes)).toThrow("Import contains too many tracks");
  });
});

describe("splitIntoBatches", () => {
  test("splits items into stable batch sizes", () => {
    expect(splitIntoBatches([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
  });

  test("returns no batches for an empty list", () => {
    expect(splitIntoBatches([], 2)).toEqual([]);
  });
});
