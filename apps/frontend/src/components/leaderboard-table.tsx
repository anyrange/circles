import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";

interface Entry {
  id: string;
  name: string;
  username: string | null;
  image: string | null;
  scrobbleCount: number;
}

interface Props {
  entries: Entry[];
}

export function LeaderboardTable({ entries }: Props) {
  return (
    <ItemGroup>
      {entries.map((entry, i) => (
        <Item key={entry.id} size="sm">
          <ItemMedia className="w-6 justify-end font-mono text-sm text-muted-foreground">
            {i + 1}
          </ItemMedia>
          <ItemMedia>
            <Avatar className="size-8">
              <AvatarImage src={entry.image ?? undefined} alt={entry.name} />
              <AvatarFallback>{entry.name[0]}</AvatarFallback>
            </Avatar>
          </ItemMedia>
          <ItemContent>
            <ItemTitle>{entry.name}</ItemTitle>
            {entry.username ? <ItemDescription>@{entry.username}</ItemDescription> : null}
          </ItemContent>
          <ItemActions className="text-sm text-muted-foreground tabular-nums">
            {entry.scrobbleCount.toLocaleString()}
          </ItemActions>
        </Item>
      ))}
    </ItemGroup>
  );
}
