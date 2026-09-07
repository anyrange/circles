import { Outlet, createFileRoute, redirect, useRouterState } from "@tanstack/react-router";
import type { CSSProperties } from "react";

import { AppSidebar } from "@/components/app-sidebar";
import { RightPanel } from "@/components/right-panel";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { getInitialAuthFn } from "@/lib/auth-session";

interface SidebarLayoutStyle extends CSSProperties {
  "--sidebar-width": string;
  "--sidebar-width-mobile": string;
}

export const Route = createFileRoute("/_authenticated")({
  ssr: "data-only",
  beforeLoad: async ({ context, location }) => {
    const auth = await getInitialAuthFn();

    if (!auth) {
      throw redirect({ to: "/", search: { redirect: location.href } });
    }

    context.queryClient.setQueryData(["me"], auth.user);
    return { auth };
  },
  component: AppLayout,
});

function AppLayout() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const showRightPanel = pathname === "/dashboard";
  const sidebarStyle: SidebarLayoutStyle = {
    "--sidebar-width": "16rem",
    "--sidebar-width-mobile": "18rem",
  };

  return (
    <SidebarProvider style={sidebarStyle}>
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
