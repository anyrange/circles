import type { AppType } from "@circles/backend/src/api/index.ts";
import { createServerFn } from "@tanstack/react-start";
import { useSession } from "@tanstack/react-start/server";
import { hc } from "hono/client";
import { z } from "zod";

import { env } from "../env";

type AppSessionData = {
  accessToken?: string;
  refreshToken?: string;
  spotifyOAuth?: {
    state: string;
    codeVerifier: string;
  };
};

const DEVELOPMENT_SESSION_SECRET = "circles-development-session-secret";

const tokenResponseSchema = z.object({
  access_token: z.string().min(1),
  refresh_token: z.string().min(1).optional(),
});

const authorizationEndpoint = `${env.VITE_API_URL}/api/auth/oauth2/authorize`;
const tokenEndpoint = `${env.VITE_API_URL}/api/auth/oauth2/token`;

function useAppSession() {
  if (import.meta.env.PROD && env.SESSION_SECRET === DEVELOPMENT_SESSION_SECRET) {
    throw new Error("SESSION_SECRET must be configured in production");
  }

  return useSession<AppSessionData>({
    name: "circles-session",
    password: env.SESSION_SECRET,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 30 * 24 * 60 * 60,
    },
  });
}

function createApiClient(accessToken: string) {
  return hc<AppType>(env.VITE_API_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

function encodeBase64Url(bytes: Uint8Array) {
  let value = "";
  for (const byte of bytes) value += String.fromCharCode(byte);
  return btoa(value).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function generateRandomValue() {
  return encodeBase64Url(crypto.getRandomValues(new Uint8Array(32)));
}

async function createCodeChallenge(codeVerifier: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(codeVerifier));
  return encodeBase64Url(new Uint8Array(digest));
}

async function requestTokens(parameters: Record<string, string>) {
  const response = await fetch(tokenEndpoint, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: env.VITE_OAUTH_CLIENT_ID,
      resource: env.VITE_API_URL,
      ...parameters,
    }),
  });

  if (!response.ok) return null;
  const result = tokenResponseSchema.safeParse(await response.json());
  return result.success ? result.data : null;
}

async function fetchMe(accessToken: string) {
  return createApiClient(accessToken).me.$get();
}

async function issueAccessToken(refreshToken: string) {
  const tokens = await requestTokens({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });
  if (!tokens) return null;

  return {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token ?? refreshToken,
  };
}

async function refreshSession(session: Awaited<ReturnType<typeof useAppSession>>) {
  const refreshToken = session.data.refreshToken;
  if (!refreshToken) return null;

  const tokens = await issueAccessToken(refreshToken);
  if (!tokens) {
    await session.clear();
    return null;
  }

  await session.update(tokens);
  return tokens.accessToken;
}

export const startSpotifySignInFn = createServerFn({ method: "POST" }).handler(async () => {
  const state = generateRandomValue();
  const codeVerifier = generateRandomValue();
  const codeChallenge = await createCodeChallenge(codeVerifier);
  const session = await useAppSession();

  await session.update({ ...session.data, spotifyOAuth: { state, codeVerifier } });

  const authorizationUrl = new URL(authorizationEndpoint);
  authorizationUrl.search = new URLSearchParams({
    client_id: env.VITE_OAUTH_CLIENT_ID,
    response_type: "code",
    redirect_uri: `${env.FRONTEND_URL}/auth/callback`,
    state,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
    scope: "openid profile email offline_access",
  }).toString();

  return authorizationUrl.toString();
});

export const establishSessionFn = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      code: z.string().min(1).max(2048),
      state: z.string().min(1).max(2048),
      issuer: z.string().url().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const session = await useAppSession();
    const spotifyOAuth = session.data.spotifyOAuth;
    if (!spotifyOAuth) return null;

    if (data.state !== spotifyOAuth.state || (data.issuer && data.issuer !== env.VITE_API_URL)) {
      await session.update({ ...session.data, spotifyOAuth: undefined });
      return null;
    }

    const tokens = await requestTokens({
      grant_type: "authorization_code",
      code: data.code,
      redirect_uri: `${env.FRONTEND_URL}/auth/callback`,
      code_verifier: spotifyOAuth.codeVerifier,
    });
    if (!tokens?.refresh_token) return null;

    const appTokens = {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
    };
    await session.update({ ...appTokens, spotifyOAuth: undefined });
    return appTokens.accessToken;
  });

export const getInitialAuthFn = createServerFn({ method: "GET" }).handler(async () => {
  const session = await useAppSession();
  let accessToken = session.data.accessToken;

  if (!accessToken || !session.data.refreshToken) return null;

  let response = await fetchMe(accessToken);
  if (response.status === 401) {
    const refreshedToken = await refreshSession(session);
    if (!refreshedToken) return null;

    accessToken = refreshedToken;
    response = await fetchMe(accessToken);
  }

  if (response.status === 401) {
    await session.clear();
    return null;
  }

  if (!response.ok) {
    throw new Error(`Failed to load current user (${response.status})`);
  }

  return { accessToken, user: await response.json() };
});

export const refreshAccessTokenFn = createServerFn({ method: "POST" }).handler(async () => {
  const session = await useAppSession();
  return refreshSession(session);
});

export const clearAppSessionFn = createServerFn({ method: "POST" }).handler(async () => {
  const session = await useAppSession();
  await session.clear();
});
