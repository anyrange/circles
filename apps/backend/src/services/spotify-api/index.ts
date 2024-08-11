import type {
  APIAlbumsResponse,
  APIArtistsResponse,
  APIAudioFeaturesResponse,
  APIMeResponse,
  APIRecentlyPlayedResponse,
  APITracksResponse,
  CodeOptions,
  Cursors,
  EntitiesIds,
  RefreshTokenOptions,
  Tokens,
  TokensError,
} from "../../types";
import { api, env } from "../../config";
import { call } from "./request";
import { createParams, isError, makeBatchedRequest } from "./helpers";

class SpotifyAPI {
  clientId: string;
  clientSecret: string;

  constructor(clientId: string, clientSecret: string) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
  }

  async fetchTokens(options: CodeOptions | RefreshTokenOptions) {
    const params = createParams(options);

    const appAuthToken = `${this.clientId}:${this.clientSecret}`;

    const data = (await fetch(api.TOKEN_ROUTE, {
      method: "POST",
      body: params,
      headers: {
        Authorization: `Basic ${Buffer.from(appAuthToken).toString("base64")}`,
      },
    }).then((res) => res.json())) as Tokens | TokensError;

    if (isError(data)) {
      throw new Error(data.error_description);
    }

    return data;
  }

  fetchMe(token: string) {
    return call<APIMeResponse>({ route: "me", token });
  }

  fetchRecentlyPlayed(token: string, limit = 10, cursors?: Partial<Cursors>) {
    const beforeParam = cursors?.before ? `&before=${cursors.before}` : "";
    const afterParam = cursors?.after ? `&after=${cursors.after}` : "";

    return call<APIRecentlyPlayedResponse>({
      route: `me/player/recently-played?limit=${limit}${beforeParam}${afterParam}`,
      token,
    });
  }

  fetchAudioFeatures(token: string, ids: string[]) {
    const request = (idsBatch: string[]) =>
      call<APIAudioFeaturesResponse>({
        route: `audio-features?ids=${idsBatch.join(",")}`,
        token,
      }).then(({ audio_features }) => audio_features);

    const batchedRequest = makeBatchedRequest(request, ids);

    return batchedRequest;
  }

  fetchAlbums(token: string, ids: string[]) {
    const request = (idsBatch: string[]) =>
      call<APIAlbumsResponse>({
        route: `albums?ids=${idsBatch.join(",")}`,
        token,
      }).then(({ albums }) => albums);

    const batchedRequest = makeBatchedRequest(
      request,
      ids,
      api.API_ALBUM_CAPACITY,
    );

    return batchedRequest;
  }

  fetchArtists(token: string, ids: string[]) {
    const request = (idsBatch: string[]) =>
      call<APIArtistsResponse>({
        route: `artists?ids=${idsBatch.join(",")}`,
        token,
      }).then(({ artists }) => artists);

    const batchedRequest = makeBatchedRequest(request, ids);

    return batchedRequest;
  }

  fetchTracks(token: string, ids: string[]) {
    const request = (idsBatch: string[]) =>
      call<APITracksResponse>({
        route: `tracks?ids=${idsBatch.join(",")}`,
        token,
      }).then(({ tracks }) => tracks);

    const batchedRequest = makeBatchedRequest(request, ids);

    return batchedRequest;
  }

  async fetchEntities(
    token: string,
    { trackIds, albumIds, artistIds }: EntitiesIds,
  ) {
    const [features, tracks, albums, artists] = await Promise.all([
      this.fetchAudioFeatures(token, trackIds),
      this.fetchTracks(token, trackIds),
      this.fetchAlbums(token, albumIds),
      this.fetchArtists(token, artistIds),
    ]);

    return { features, tracks, albums, artists };
  }
}

export const spotifyAPI = new SpotifyAPI(
  env.SPOTIFY_CLIENT_ID,
  env.SPOTIFY_CLIENT_SECRET,
);
