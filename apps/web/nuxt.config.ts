// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { defineNuxtConfig, NuxtConfig } from "nuxt/config"

import {
  SPOTIFY_CLIENT_ID,
  SPOTIFY_CLIENT_SECRET,
  APP_URL,
} from "./src/config/env"

export default defineNuxtConfig({
  rootDir: "./src",
  modules: ["@vueuse/nuxt", "@pinia/nuxt", "@pinia-plugin-persistedstate/nuxt"],
  build: {
    transpile: ["trpc-nuxt"],
  },
  runtimeConfig: {
    spotifyClientSecret: SPOTIFY_CLIENT_SECRET,
    public: {
      spotifyClientId: SPOTIFY_CLIENT_ID,
      appURL: APP_URL,
    },
  },
})
