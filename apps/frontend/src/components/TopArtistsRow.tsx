import { Link } from "@tanstack/react-router";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Artist {
  id: string;
  name: string;
  images?: { url: string }[] | null;
}

interface Props {
  artists: { artist: Artist; playCount: number }[];
}

export function TopArtistsRow({ artists }: Props) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {artists.map((item) => (
        <Link
          key={item.artist.id}
          to="/artists/$artistId"
          params={{ artistId: item.artist.id }}
          className="flex w-28 shrink-0 flex-col items-center gap-2"
        >
          <Avatar className="size-20">
            <AvatarImage
              src={item.artist.images?.[0]?.url}
              alt={item.artist.name}
              className="object-cover"
            />
            <AvatarFallback className="text-lg">{item.artist.name[0]}</AvatarFallback>
          </Avatar>
          <div className="w-full text-center">
            <p className="truncate text-xs font-medium">{item.artist.name}</p>
            <p className="text-xs text-muted-foreground">{item.playCount} plays</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
