import { Link } from "@tanstack/react-router";
import { Music2 } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
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
              <ItemGroup>
                {stats.topArtists.slice(0, 5).map((item) => (
                  <Item key={item.artist.id} asChild size="sm" className="rounded-2xl">
                    <Link to="/artists/$artistId" params={{ artistId: item.artist.id }}>
                      <ItemMedia>
                        <Avatar size="lg">
                          <AvatarImage
                            src={item.artist.images?.[0]?.url}
                            className="object-cover"
                          />
                          <AvatarFallback>{item.artist.name[0]}</AvatarFallback>
                        </Avatar>
                      </ItemMedia>
                      <ItemContent>
                        <ItemTitle>{item.artist.name}</ItemTitle>
                        <ItemDescription>{item.playCount} plays</ItemDescription>
                      </ItemContent>
                    </Link>
                  </Item>
                ))}
              </ItemGroup>
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
              <ItemGroup>
                {stats.topTracks.slice(0, 5).map((item) => (
                  <Item key={item.track.id} asChild size="sm" className="rounded-2xl">
                    <Link to="/tracks/$trackId" params={{ trackId: item.track.id }}>
                      <ItemMedia variant={item.track.albumImageUrl ? "image" : "icon"}>
                        {item.track.albumImageUrl ? (
                          <img src={item.track.albumImageUrl} alt="" />
                        ) : (
                          <Music2 />
                        )}
                      </ItemMedia>
                      <ItemContent>
                        <ItemTitle>{item.track.name}</ItemTitle>
                        <ItemDescription>{item.playCount} plays</ItemDescription>
                      </ItemContent>
                    </Link>
                  </Item>
                ))}
              </ItemGroup>
            </section>
          )}
        </div>
      </div>
    </aside>
  );
}
