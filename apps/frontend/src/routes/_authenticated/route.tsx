import { Outlet, createFileRoute, redirect, useRouterState } from "@tanstack/react-router";
import type { CSSProperties } from "react";

import { AppSidebar } from "@/components/app-sidebar";
import { RightPanel } from "@/components/right-panel";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async ({ location }) => {
    const { data: session } = await authClient.getSession();

    if (!session) {
      throw redirect({ to: "/", search: { redirect: location.href } });
    }
  },
  component: AppLayout,
});

function AppLayout() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const showRightPanel = pathname === "/dashboard";

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
      {showRightPanel ? <RightPanel /> : null}
    </SidebarProvider>
  );
}
