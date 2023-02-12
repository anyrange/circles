export { default as parseHistory } from "./parseHistory"
export { default as refreshTokens } from "./refreshTokens"

import { updateUserHistory } from "./parseHistory"
import { updateUserTokens } from "./refreshTokens"

export const functions = { updateUserHistory, updateUserTokens }
