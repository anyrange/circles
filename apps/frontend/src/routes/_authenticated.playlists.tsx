import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { TrackRow } from "@/components/TrackRow";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useCreatePlaylist,
  useDeletePlaylist,
  usePlaylists,
  usePlaylistTracks,
} from "@/lib/use-playlists";

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
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Playlists</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">New playlist</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create playlist</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-3">
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Playlist name"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
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
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      )}

      {data?.playlists.length === 0 && <p className="text-muted-foreground">No playlists yet.</p>}

      <div className="space-y-3">
        {data?.playlists.map((playlist) => (
          <Card
            key={playlist.id}
            className={`cursor-pointer transition-colors hover:bg-muted/30 ${
              selectedId === playlist.id ? "ring-1 ring-primary" : ""
            }`}
            onClick={() => setSelectedId(selectedId === playlist.id ? null : playlist.id)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{playlist.name}</CardTitle>
                <div className="flex items-center gap-2">
                  {playlist.isAuto && (
                    <Badge variant="secondary" className="text-xs">
                      Auto
                    </Badge>
                  )}
                  {!playlist.isAuto && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs text-muted-foreground"
                      onClick={(e) => {
                        e.stopPropagation();
                        deletePlaylist.mutate(playlist.id);
                      }}
                    >
                      Delete
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            {selectedId === playlist.id && (
              <CardContent>
                <PlaylistTrackList id={playlist.id} />
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

function PlaylistTrackList({ id }: { id: string }) {
  const { data, isLoading } = usePlaylistTracks(id);

  if (isLoading) return <Skeleton className="h-20 w-full" />;
  if (!data?.tracks.length) return <p className="text-sm text-muted-foreground">No tracks.</p>;

  return (
    <ol className="space-y-2">
      {data.tracks.map((item, i) => (
        <li key={item.track.id}>
          <TrackRow
            compact
            title={item.track.name}
            leading={i + 1}
            to={`/tracks/${item.track.id}`}
          />
        </li>
      ))}
    </ol>
  );
}
