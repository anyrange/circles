import { Link, createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { Page, PageHeader, PageTitle } from "@/components/page-shell";
import { TrackRow } from "@/components/track-row";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useCreatePlaylist,
  useDeletePlaylist,
  usePlaylists,
  usePlaylistTracks,
} from "@/lib/queries/playlists";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/playlists")({
  component: PlaylistsPage,
});

function PlaylistsPage() {
  const { data, isLoading } = usePlaylists();
  const createPlaylist = useCreatePlaylist();
  const deletePlaylist = useDeletePlaylist();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [open, setOpen] = useState(false);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    await createPlaylist.mutateAsync({ name: newName });
    setNewName("");
    setOpen(false);
  }

  return (
    <Page>
      <div className="flex items-center justify-between">
        <PageHeader>
          <PageTitle>Playlists</PageTitle>
        </PageHeader>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">New playlist</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create playlist</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="flex flex-col gap-3">
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Playlist name"
                autoFocus
              />
              <Button type="submit" disabled={createPlaylist.isPending}>
                Create
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading && (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      )}

      {data?.playlists.length === 0 && <p className="text-muted-foreground">No playlists yet.</p>}

      <div className="flex flex-col gap-3">
        {data?.playlists.map((playlist) => (
          <Card
            key={playlist.id}
            className={cn(
              "cursor-pointer transition-colors",
              selectedId === playlist.id && "ring-primary",
            )}
            onClick={() => setSelectedId(selectedId === playlist.id ? null : playlist.id)}
          >
            <CardHeader>
              <CardTitle>{playlist.name}</CardTitle>
              <CardAction className="flex items-center gap-2">
                {playlist.isAuto && <Badge variant="secondary">Auto</Badge>}
                {!playlist.isAuto && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      deletePlaylist.mutate(playlist.id);
                    }}
                  >
                    Delete
                  </Button>
                )}
              </CardAction>
            </CardHeader>
            {selectedId === playlist.id && (
              <CardContent>
                <PlaylistTrackList id={playlist.id} />
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </Page>
  );
}

function PlaylistTrackList({ id }: { id: string }) {
  const { data, isLoading } = usePlaylistTracks(id);

  if (isLoading) return <Skeleton className="h-20 w-full" />;
  if (!data?.tracks.length) return <p className="text-sm text-muted-foreground">No tracks.</p>;

  return (
    <ol className="flex flex-col gap-2">
      {data.tracks.map((item, i) => (
        <li key={item.track.id}>
          <TrackRow compact asChild>
            <Link to="/tracks/$trackId" params={{ trackId: item.track.id }}>
              <TrackRow.Leading>{i + 1}</TrackRow.Leading>
              <TrackRow.Artwork />
              <TrackRow.Content>
                <TrackRow.Title>{item.track.name}</TrackRow.Title>
              </TrackRow.Content>
            </Link>
          </TrackRow>
        </li>
      ))}
    </ol>
  );
}
