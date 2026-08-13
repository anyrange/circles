import { oauthProviderClient } from "@better-auth/oauth-provider/client";
import { createAuthClient } from "better-auth/react";

import { env } from "../env";

export const authClient = createAuthClient({
  baseURL: env.VITE_API_URL,
  plugins: [oauthProviderClient()],
});
