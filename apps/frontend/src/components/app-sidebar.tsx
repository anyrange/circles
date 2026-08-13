import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  ChevronsUpDown,
  Clock,
  Disc3,
  Home,
  LogOut,
  Settings,
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
import { setAccessToken } from "@/lib/access-token";
import { clearAppSessionFn } from "@/lib/auth-session";
import { useMeQuery } from "@/lib/queries/me";

const NAV = [
  { label: "Home", icon: Home, to: "/dashboard" },
  { label: "History", icon: Clock, to: "/history" },
  { label: "Social", icon: Users, to: "/social" },
  { label: "Time Machine", icon: Disc3, to: "/time-machine" },
] as const;

export function AppSidebar() {
  const { location } = useRouterState();
  const path = location.pathname;
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const navigate = useNavigate();

  const { data: me } = useMeQuery();

  async function logout() {
    await clearAppSessionFn();
    setAccessToken(null);
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
                    <SidebarMenuButton asChild isActive={active} tooltip={{ children: label }}>
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
                <SidebarMenuButton
                  size="lg"
                  className="h-auto py-2"
                  tooltip={{ children: "Account" }}
                >
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
              <DropdownMenuContent side={collapsed ? "right" : "top"} align="end" className="w-64">
                <DropdownMenuLabel className="flex items-center gap-3">
                  <Avatar size="lg">
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
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link
                    to="/u/$username"
                    params={{ username: me?.username ?? "" }}
                    search={{
                      view: "overview",
                      tab: "artists",
                      range: "30d",
                      artistsRange: "30d",
                      albumsRange: "30d",
                      tracksRange: "30d",
                    }}
                  >
                    <UserRound />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/settings">
                    <Settings />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
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
