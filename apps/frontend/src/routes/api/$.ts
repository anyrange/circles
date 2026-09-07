import { createFileRoute } from "@tanstack/react-router";

import { env } from "@/env";
import { proxyApiRequest } from "@/lib/api-proxy";

export const Route = createFileRoute("/api/$")({
  server: {
    handlers: {
      ANY: ({ request }) => proxyApiRequest(request, env.API_URL),
    },
  },
});
