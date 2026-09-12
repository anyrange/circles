import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import { z } from "zod";

const httpErrorSchema = z.object({
  status: z.number().optional(),
  statusCode: z.number().optional(),
});

function isUnauthorizedError(error: Error) {
  const result = httpErrorSchema.safeParse(error);
  return result.success && (result.data.status === 401 || result.data.statusCode === 401);
}

function handleAuthError(error: Error) {
  if (isUnauthorizedError(error)) {
    globalThis.window?.location.replace("/");
  }
}

export function getContext() {
  const queryClient = new QueryClient({
    queryCache: new QueryCache({ onError: handleAuthError }),
    mutationCache: new MutationCache({ onError: handleAuthError }),
    defaultOptions: {
      queries: {
        retry: (failureCount, error) => !isUnauthorizedError(error) && failureCount < 3,
      },
      mutations: { retry: false },
    },
  });

  return { queryClient };
}
