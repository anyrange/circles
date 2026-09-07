import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { betterAuth, type BetterAuthOptions } from "better-auth";

import { config } from "../config";
import { db as drizzleDb } from "../db/postgres";
import * as schema from "../db/postgres/schema";

export const auth = betterAuth({
  secret: config.auth.secret,
  baseURL: config.frontend.url,
  trustedOrigins: [config.frontend.url],
  advanced: {
    useSecureCookies: !config.isDevelopment,
    defaultCookieAttributes: {
      sameSite: "lax",
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
    },
  }) as BetterAuthOptions["database"],
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
    user: {
      create: {
        before: async (user) => {
          // Allocate once at creation. A UUID avoids a racy username availability query.
          const base =
            user.name
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .slice(0, 12) || "user";
          return { data: { ...user, username: `${base}-${crypto.randomUUID()}` } };
        },
      },
    },
  },
});

export type Auth = typeof auth;
