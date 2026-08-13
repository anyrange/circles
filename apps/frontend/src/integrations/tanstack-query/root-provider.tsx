import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import { z } from "zod";

import { setAccessToken } from "@/lib/access-token";
import { refreshAccessTokenFn } from "@/lib/auth-session";

let refreshPromise: Promise<string> | null = null;

const httpErrorSchema = z.object({
  status: z.number().optional(),
  statusCode: z.number().optional(),
});

function isUnauthorizedError(error: Error) {
  const result = httpErrorSchema.safeParse(error);
  return result.success && (result.data.status === 401 || result.data.statusCode === 401);
}

async function refreshAccessToken() {
  refreshPromise ??= refreshAccessTokenFn()
    .then((token) => {
      if (!token) throw new Error("Unable to refresh access token");
      setAccessToken(token);
      return token;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}

async function recoverFromUnauthorized(retry: () => Promise<void>) {
  try {
    await refreshAccessToken();
    await retry();
  } catch {
    setAccessToken(null);
    globalThis.window?.location.replace("/");
  }
}

export function getContext() {
  const queryClient = new QueryClient({
    queryCache: new QueryCache({
      onError: async (error, query) => {
        if (isUnauthorizedError(error)) {
          await recoverFromUnauthorized(async () => {
            await query.fetch();
          });
        }
      },
    }),
    mutationCache: new MutationCache({
      onError: async (error, _variables, _context, mutation) => {
        if (isUnauthorizedError(error)) {
          await recoverFromUnauthorized(async () => {
            await mutation.execute(mutation.state.variables);
          });
        }
      },
    }),
    defaultOptions: {
      queries: {
        retry: (failureCount, error) => !isUnauthorizedError(error) && failureCount < 3,
      },
      mutations: {
        retry: false,
      },
    },
  });

  return {
    queryClient,
  };
}
