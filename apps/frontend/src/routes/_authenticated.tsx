import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";

import { authClient } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async ({ location }) => {
    if (typeof window !== "undefined") {
      const { data: session } = await authClient.getSession();
      if (!session) {
        throw redirect({ to: "/", search: { redirect: location.href } });
      }
    }
  },
  component: () => <Outlet />,
});
