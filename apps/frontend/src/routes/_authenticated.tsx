import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";
import type { CSSProperties } from "react";

import { AppSidebar } from "@/components/AppSidebar";
import { RightPanel } from "@/components/RightPanel";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth";
import { consumeSessionTokenFromUrl, getSessionToken } from "@/lib/session-token";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async ({ location }) => {
    if (typeof window !== "undefined") {
      const token = consumeSessionTokenFromUrl() ?? getSessionToken();
      if (token) return;

      const { data: session } = await authClient.getSession();
      if (!session) {
        throw redirect({ to: "/", search: { redirect: location.href } });
      }
    }
  },
  component: AppLayout,
});

function AppLayout() {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "16rem",
          "--sidebar-width-mobile": "18rem",
        } as CSSProperties
      }
    >
      <AppSidebar />
      <SidebarInset className="min-h-screen overflow-hidden">
        <div className="flex h-full flex-1 flex-col overflow-hidden">
          <header className="flex h-12 shrink-0 items-center gap-2 px-4 pt-4">
            <SidebarTrigger />
          </header>
          <main className="flex-1 overflow-y-auto">
            <Outlet />
          </main>
        </div>
      </SidebarInset>
      <RightPanel />
    </SidebarProvider>
  );
}
