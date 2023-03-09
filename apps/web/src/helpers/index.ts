import { SCOPES } from "~~/config"

export const getRedirectURI = () => {
  const runtimeConfig = useRuntimeConfig()
  return `${runtimeConfig.public.appURL}/callback`
}

export const getOAuthURL = () => {
  const runtimeConfig = useRuntimeConfig()
  return `https://accounts.spotify.com/authorize?response_type=code&client_id=${
    runtimeConfig.public.spotifyClientId
  }&scope=${SCOPES.join(" ")}&redirect_uri=${getRedirectURI()}`
}
