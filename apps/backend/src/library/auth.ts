import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { betterAuth } from "better-auth";

import { config } from "../config";
import { db as drizzleDb } from "../db/postgres";
import * as schema from "../db/postgres/schema";
import { syncHistory } from "../worker/workflows/sync-history";

export const auth = betterAuth({
  secret: config.auth.secret,
  baseURL: config.http.url,
  trustedOrigins: [config.frontend.url],
  account: {
    skipStateCookieCheck: true,
  },
  database: drizzleAdapter(drizzleDb, {
    provider: "pg",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
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
    },
  },
  databaseHooks: {
    session: {
      create: {
        after: async (session) => {
          await syncHistory.runNoWait({ userId: session.userId });
        },
      },
    },
  },
});

export type Auth = typeof auth;
