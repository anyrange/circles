import { APIMeResponse } from "@circles/types"
import spotifyAPI from "./spotifyAPI"

export function me(token: string) {
  return spotifyAPI<APIMeResponse>({ route: "me", token })
}

export default {
  me,
}
