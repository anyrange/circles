import { createFileRoute, redirect } from "@tanstack/react-router";
import { z } from "zod";

import { establishSessionFn } from "@/lib/auth-session";

export const Route = createFileRoute("/auth/callback")({
  validateSearch: z.object({
    code: z.string().optional(),
    state: z.string().optional(),
    iss: z.string().url().optional(),
    error: z.string().optional(),
  }),
  beforeLoad: async ({ search }) => {
    if (!search.code || !search.state || search.error) throw redirect({ to: "/" });

    const accessToken = await establishSessionFn({
      data: { code: search.code, state: search.state, issuer: search.iss },
    });
    if (!accessToken) throw redirect({ to: "/" });
    throw redirect({ to: "/dashboard" });
  },
  component: AuthCallback,
});

function AuthCallback() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <p className="text-sm text-muted-foreground">Completing sign in…</p>
    </main>
  );
}
