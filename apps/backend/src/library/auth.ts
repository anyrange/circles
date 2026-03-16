import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { betterAuth } from "better-auth";
import { eq } from "drizzle-orm";

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
          // Auto-generate username if not set
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
        },
      },
    },
  },
});

export type Auth = typeof auth;
