import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/auth/consent")({
  beforeLoad: () => {
    throw redirect({ to: "/" });
  },
});
