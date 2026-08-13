import { useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { Database, Trash2, UserRound } from "lucide-react";

import {
  Page,
  PageDescription,
  PageHeader,
  PageSection,
  PageSectionTitle,
  PageTitle,
} from "@/components/page-shell";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
import { setAccessToken } from "@/lib/access-token";
import { clearAppSessionFn } from "@/lib/auth-session";
import { useDeleteAccount, useMeQuery } from "@/lib/queries/me";

export const Route = createFileRoute("/_authenticated/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const { data: me } = useMeQuery();
  const deleteAccount = useDeleteAccount();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  async function handleDeleteAccount(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();

    try {
      await deleteAccount.mutateAsync();
      await clearAppSessionFn();
      setAccessToken(null);
      queryClient.clear();
      await navigate({ to: "/", replace: true });
    } catch {
      // The mutation exposes the server error in the confirmation dialog.
    }
  }

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

      <Separator />

      <PageSection className="gap-4">
        <PageSectionTitle>Delete account</PageSectionTitle>
        <div className="flex flex-col gap-4 rounded-lg border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium">Permanently delete your account</p>
            <p className="text-sm text-muted-foreground">
              Remove your profile, listening history, follows, playlists, and imported data.
            </p>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 data-icon="inline-start" />
                Delete account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete your account?</AlertDialogTitle>
                <AlertDialogDescription>
                  This permanently deletes your Circles account and all of its data. This action
                  cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              {deleteAccount.error ? (
                <p role="alert" className="text-sm text-destructive">
                  We couldn&apos;t delete your account. Please try again.
                </p>
              ) : null}
              <AlertDialogFooter>
                <AlertDialogCancel disabled={deleteAccount.isPending}>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  variant="destructive"
                  disabled={deleteAccount.isPending}
                  onClick={handleDeleteAccount}
                >
                  {deleteAccount.isPending ? "Deleting…" : "Delete account"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </PageSection>
    </Page>
  );
}
