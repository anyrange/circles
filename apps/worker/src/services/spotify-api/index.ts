import { SpotifyAPI } from "@circles/spotify-api"
import { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } from "../../config"

export const spotifyAPI = new SpotifyAPI(
  SPOTIFY_CLIENT_ID,
  SPOTIFY_CLIENT_SECRET
)

const REVOKED_MESSAGE = "Refresh token revoked"

export async function refreshTokens({
  id,
  refresh_token,
}: {
  id: string
  refresh_token: string
}) {
  try {
    const { access_token } = await spotifyAPI.fetchTokens({ refresh_token })

    return { access_token, id, is_active: true }
  } catch (e) {
    if ((e as Error).message === REVOKED_MESSAGE) {
      return { access_token: "", id, is_active: false }
    }

    throw e
  }
}
