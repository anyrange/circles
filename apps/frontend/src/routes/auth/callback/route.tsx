import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/auth/callback")({
  beforeLoad: () => {
    // better-auth handles the OAuth callback directly at /api/auth/callback/spotify
    // and redirects to callbackURL (/dashboard). This route is no longer needed
    // but kept to avoid 404s from any lingering links.
    throw redirect({ to: "/" });
  },
  component: () => null,
});
