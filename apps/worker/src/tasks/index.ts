import { SpotifyHistoryParser } from "./spotify/history"
import { SpotifyTokensParser } from "./spotify/tokens"

export const activeTasks = [SpotifyHistoryParser, SpotifyTokensParser] as const
