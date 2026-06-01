import { Link } from "@tanstack/react-router";
import { Music2 } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useStats } from "@/lib/queries/stats";

export function RightPanel() {
  const { data: stats } = useStats("30d");

  return (
    <aside className="hidden w-full max-w-[20rem] shrink-0 xl:block">
      <div className="sticky top-0 flex h-screen flex-col overflow-hidden px-4 pt-4 pb-4">
        <div className="mb-4 flex flex-col gap-1 px-2">
          <h2 className="text-sm font-medium">Listening pulse</h2>
          <p className="text-sm text-muted-foreground">Your last 30 days</p>
        </div>

        <div className="flex flex-1 flex-col gap-5 overflow-y-auto">
          <section className="flex flex-col gap-2">
            <h3 className="px-2 text-sm font-medium">Current obsessions</h3>
            {stats ? (
              <div className="flex flex-col gap-1">
                {stats.topArtists.slice(0, 5).map((item) => (
                  <Link
                    key={item.artist.id}
                    to="/artists/$artistId"
                    params={{ artistId: item.artist.id }}
                    className="flex items-center gap-3 rounded-2xl px-3 py-2.5 transition-colors hover:bg-muted/50"
                  >
                    <Avatar size="lg">
                      <AvatarImage src={item.artist.images?.[0]?.url} className="object-cover" />
                      <AvatarFallback>{item.artist.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">
                        {item.artist.name}
                      </p>
                      <p className="text-xs text-muted-foreground">{item.playCount} plays</p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-2 px-2 py-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center gap-3 rounded-xl px-3 py-2">
                    <Skeleton className="size-10 rounded-full" />
                    <div className="flex flex-col gap-1">
                      <Skeleton className="h-3.5 w-24" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {stats && stats.topTracks.length > 0 && (
            <section className="flex flex-col gap-2">
              <h3 className="px-2 text-sm font-medium">Top tracks</h3>
              <div className="flex flex-col gap-1">
                {stats.topTracks.slice(0, 5).map((item) => (
                  <Link
                    key={item.track.id}
                    to="/tracks/$trackId"
                    params={{ trackId: item.track.id }}
                    className="flex items-center gap-3 rounded-2xl px-3 py-2.5 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-muted text-muted-foreground">
                      {item.track.albumImageUrl ? (
                        <img
                          src={item.track.albumImageUrl}
                          alt=""
                          className="size-full object-cover"
                        />
                      ) : (
                        <Music2 className="size-4" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">
                        {item.track.name}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {item.playCount} plays
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </aside>
  );
}
