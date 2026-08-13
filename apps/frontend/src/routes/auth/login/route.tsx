import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef } from "react";

import { authClient } from "@/lib/auth";

export const Route = createFileRoute("/auth/login")({
  ssr: false,
  component: BetterAuthLogin,
});

function BetterAuthLogin() {
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    void authClient.signIn.social({ provider: "spotify" }).then(
      ({ error }) => {
        if (error) window.location.replace("/");
      },
      () => window.location.replace("/"),
    );
  }, []);

  return null;
}
