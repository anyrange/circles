import { SpotifyAPI } from "@circles/spotify-api"
import { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } from "~~/config/env"

export const spotifyAPI = new SpotifyAPI(
  SPOTIFY_CLIENT_ID,
  SPOTIFY_CLIENT_SECRET
)
