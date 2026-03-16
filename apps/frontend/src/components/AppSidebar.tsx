import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  ChevronsUpDown,
  Clock,
  Disc3,
  Download,
  Home,
  LibraryBig,
  LayoutList,
  LogOut,
  Sparkles,
  UserRound,
  Users,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { api } from "@/lib/api";
import { authClient } from "@/lib/auth";

const NAV = [
  { label: "Home", icon: Home, to: "/dashboard" },
  { label: "Library", icon: LibraryBig, to: "/library" },
  { label: "History", icon: Clock, to: "/history" },
  { label: "Social", icon: Users, to: "/social" },
  { label: "Playlists", icon: LayoutList, to: "/playlists" },
  { label: "Discover", icon: Sparkles, to: "/tools" },
  { label: "Import", icon: Download, to: "/import" },
  { label: "Time Machine", icon: Disc3, to: "/time-machine" },
] as const;

export function AppSidebar() {
  const { location } = useRouterState();
  const path = location.pathname;
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const navigate = useNavigate();

  const { data: me } = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const res = await api.me.$get();
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  async function logout() {
    await authClient.signOut();
    await navigate({ to: "/" });
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              size="lg"
              className="hover:bg-transparent active:bg-transparent"
            >
              <Link to="/dashboard">
                {collapsed ? (
                  <img src="/logo-icon.svg" alt="circles" className="size-6 shrink-0" />
                ) : (
                  <img src="/logo-full.svg" alt="Circles" className="h-6 w-auto" />
                )}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV.map(({ label, icon: Icon, to }) => {
                const active = path === to || (to !== "/dashboard" && path.startsWith(to));
                return (
                  <SidebarMenuItem key={to}>
                    <SidebarMenuButton asChild isActive={active} tooltip={label}>
                      <Link to={to}>
                        <Icon />
                        <span>{label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton size="lg" className="h-auto py-2" tooltip="Account">
                  <Avatar className="size-8 shrink-0">
                    <AvatarImage src={me?.avatarUrl ?? undefined} />
                    <AvatarFallback className="text-xs">
                      {me?.displayName?.[0] ?? "?"}
                    </AvatarFallback>
                  </Avatar>
                  {!collapsed && (
                    <>
                      <div className="min-w-0 flex-1 text-left">
                        <p className="truncate text-sm leading-tight font-medium">
                          {me?.displayName ?? "…"}
                        </p>
                        <p className="truncate text-xs leading-tight text-muted-foreground">
                          {me?.username ? `@${me.username}` : (me?.email ?? "")}
                        </p>
                      </div>
                      <ChevronsUpDown className="ml-auto size-4 text-muted-foreground" />
                    </>
                  )}
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side={collapsed ? "right" : "top"}
                align="end"
                className="w-64 rounded-[1.75rem] p-2"
              >
                <DropdownMenuLabel className="px-2 py-2.5">
                  <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card/50 px-3 py-3">
                    <Avatar className="size-10 shrink-0">
                      <AvatarImage src={me?.avatarUrl ?? undefined} />
                      <AvatarFallback>{me?.displayName?.[0] ?? "?"}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">
                        {me?.displayName ?? "Account"}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {me?.username ? `@${me.username}` : (me?.email ?? "")}
                      </p>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/u/$username" params={{ username: me?.username ?? "" }}>
                    <UserRound />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={logout}>
                  <LogOut />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
