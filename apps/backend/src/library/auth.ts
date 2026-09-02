import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import {
  oauthProvider,
  oauthProviderAuthServerMetadata,
  oauthProviderOpenIdConfigMetadata,
} from "@better-auth/oauth-provider";
import { betterAuth, type BetterAuthOptions } from "better-auth";
import { jwt } from "better-auth/plugins";
import { eq } from "drizzle-orm";

import { config } from "../config";
import { db as drizzleDb } from "../db/postgres";
import * as schema from "../db/postgres/schema";
import { syncHistory } from "../worker/workflows/sync-history";
import { syncSavedTracks } from "../worker/workflows/sync-saved-tracks";

const oauthScopes = ["openid", "profile", "email", "offline_access"];

export const auth = betterAuth({
  secret: config.auth.secret,
  baseURL: config.http.url,
  trustedOrigins: [config.frontend.url],
  disabledPaths: ["/token"],
  advanced: {
    useSecureCookies: !config.isDevelopment,
    defaultCookieAttributes: {
      sameSite: config.isDevelopment ? "lax" : "none",
      secure: !config.isDevelopment,
    },
  },
  // SAFETY: Better Auth's Drizzle adapter returns its database contract, but its generic
  // schema inference is not assignable to the broader option type across these package versions.
  database: drizzleAdapter(drizzleDb, {
    provider: "pg",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
      jwks: schema.jwks,
      oauthClient: schema.oauthClient,
      oauthRefreshToken: schema.oauthRefreshToken,
      oauthAccessToken: schema.oauthAccessToken,
      oauthConsent: schema.oauthConsent,
    },
  }) as BetterAuthOptions["database"],
  plugins: [
    jwt({
      disableSettingJwtHeader: true,
      jwt: {
        issuer: config.http.url,
        audience: config.http.url,
        expirationTime: "15m",
      },
    }),
    oauthProvider({
      loginPage: `${config.frontend.url}/auth/login`,
      consentPage: `${config.frontend.url}/auth/consent`,
      scopes: oauthScopes,
      validAudiences: [config.http.url],
      cachedTrustedClients: new Set([config.auth.clientId]),
      accessTokenExpiresIn: 15 * 60,
      refreshTokenExpiresIn: 30 * 24 * 60 * 60,
      silenceWarnings: {
        oauthAuthServerConfig: true,
        openidConfig: true,
      },
    }),
  ],
  socialProviders: {
    spotify: {
      clientId: config.spotify.clientId,
      clientSecret: config.spotify.clientSecret,
      scope: config.spotify.scopes,
    },
  },
  user: {
    additionalFields: {
      spotifyId: {
        type: "string",
        required: false,
        fieldName: "spotifyId",
      },
      username: {
        type: "string",
        required: false,
        fieldName: "username",
      },
      isPublic: {
        type: "boolean",
        required: false,
        defaultValue: true,
        fieldName: "isPublic",
      },
      bio: {
        type: "string",
        required: false,
        fieldName: "bio",
      },
    },
  },
  databaseHooks: {
    session: {
      create: {
        after: async (session) => {
          const [existingUser] = await drizzleDb
            .select({ username: schema.user.username, name: schema.user.name })
            .from(schema.user)
            .where(eq(schema.user.id, session.userId))
            .limit(1);

          if (existingUser && !existingUser.username) {
            const base =
              (existingUser.name ?? "user")
                .toLowerCase()
                .replace(/\s+/g, "-")
                .replace(/[^a-z0-9-]/g, "")
                .slice(0, 40) || "user";

            let username = base;
            let attempts = 0;

            while (attempts < 10) {
              const [conflict] = await drizzleDb
                .select({ id: schema.user.id })
                .from(schema.user)
                .where(eq(schema.user.username, username))
                .limit(1);

              if (!conflict) break;

              const suffix = Math.random().toString(36).slice(2, 6);
              username = `${base}-${suffix}`;
              attempts++;
            }

            await drizzleDb
              .update(schema.user)
              .set({ username })
              .where(eq(schema.user.id, session.userId));
          }

          await syncHistory.runNoWait({ userId: session.userId });
          await syncSavedTracks.runNoWait({ userId: session.userId });
        },
      },
    },
  },
});

export async function ensureFrontendOAuthClient() {
  const now = new Date();
  await drizzleDb
    .insert(schema.oauthClient)
    .values({
      id: config.auth.clientId,
      clientId: config.auth.clientId,
      name: "Circles frontend",
      redirectUris: [`${config.frontend.url}/auth/callback`],
      tokenEndpointAuthMethod: "none",
      grantTypes: ["authorization_code", "refresh_token"],
      responseTypes: ["code"],
      scopes: [...oauthScopes],
      public: true,
      type: "web",
      requirePKCE: true,
      skipConsent: true,
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: schema.oauthClient.clientId,
      set: {
        redirectUris: [`${config.frontend.url}/auth/callback`],
        scopes: [...oauthScopes],
        updatedAt: now,
      },
    });
}

export function verifyOAuthAccessToken(token: string) {
  return auth.api.verifyJWT({ body: { token } });
}

export const oauthAuthorizationServerMetadata = oauthProviderAuthServerMetadata(auth);
export const oauthOpenIdConfiguration = oauthProviderOpenIdConfigMetadata(auth);

export type Auth = typeof auth;
