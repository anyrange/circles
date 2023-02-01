import { defineNuxtConfig, NuxtConfig } from "nuxt/config"

import {
  SPOTIFY_CLIENT_ID,
  SPOTIFY_CLIENT_SECRET,
} from "./src/config/env.config"

export default defineNuxtConfig({
  rootDir: "./src",
  build: {
    transpile: ["trpc-nuxt"],
  },
  runtimeConfig: {
    spotifyClientSecret: SPOTIFY_CLIENT_SECRET,
    public: {
      spotifyClientId: SPOTIFY_CLIENT_ID,
      appURL: "http://localhost:3000",
    },
  },
})
