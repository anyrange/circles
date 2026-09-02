import { describe, expect, test } from "vite-plus/test";

import { hasSpotifyScope } from "./spotify";

describe("hasSpotifyScope", () => {
  test("recognizes Spotify scopes without matching partial names", () => {
    expect(hasSpotifyScope("user-read-private user-library-read", "user-library-read")).toBe(true);
    expect(hasSpotifyScope("user-library-read-extra", "user-library-read")).toBe(false);
    expect(hasSpotifyScope(null, "user-library-read")).toBe(false);
  });
});
