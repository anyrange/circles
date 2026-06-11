import { Link, createFileRoute } from "@tanstack/react-router";
import { Database, UserRound } from "lucide-react";

import {
  Page,
  PageDescription,
  PageHeader,
  PageSection,
  PageSectionTitle,
  PageTitle,
} from "@/components/page-shell";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { Separator } from "@/components/ui/separator";
import { useMeQuery } from "@/lib/queries/me";

export const Route = createFileRoute("/_authenticated/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const { data: me } = useMeQuery();

  return (
    <Page className="max-w-5xl">
      <PageHeader>
        <PageTitle>Settings</PageTitle>
        <PageDescription>Manage your profile, privacy, and account data.</PageDescription>
      </PageHeader>

      <PageSection className="gap-4">
        <PageSectionTitle>Account</PageSectionTitle>
        <div className="flex flex-col gap-4 rounded-lg border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <Avatar className="size-12 shrink-0">
              <AvatarImage src={me?.avatarUrl ?? undefined} />
              <AvatarFallback>{me?.displayName?.[0] ?? "?"}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{me?.displayName ?? "Account"}</p>
              <p className="truncate text-sm text-muted-foreground">
                {me?.username ? `@${me.username}` : (me?.email ?? "")}
              </p>
            </div>
          </div>
          <Button asChild variant="outline">
            <Link to="/u/$username" params={{ username: me?.username ?? "" }}>
              <UserRound />
              Profile
            </Link>
          </Button>
        </div>
      </PageSection>

      <Separator />

      <PageSection className="gap-4">
        <PageSectionTitle>Data</PageSectionTitle>
        <ItemGroup>
          <Item asChild variant="outline">
            <Link to="/data/import">
              <ItemMedia variant="icon">
                <Database />
              </ItemMedia>
              <ItemContent>
                <ItemTitle>Import Spotify history</ItemTitle>
                <ItemDescription>
                  Upload a Spotify export to refresh tracks, albums, artists, and play history.
                </ItemDescription>
              </ItemContent>
            </Link>
          </Item>
        </ItemGroup>
      </PageSection>
    </Page>
  );
}
