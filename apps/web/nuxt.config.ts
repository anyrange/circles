// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { defineNuxtConfig, NuxtConfig } from "nuxt/config"

import { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } from "./src/config/env"

export default defineNuxtConfig({
  rootDir: "./src",
  modules: [],
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
