import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";

interface Match {
  id: string;
  name: string;
  username: string | null;
  image: string | null;
  sharedCount: number;
}

interface Props {
  match: Match;
}

export function MusicMatchCard({ match }: Props) {
  return (
    <Card>
      <CardContent>
        <Item className="p-0">
          <ItemMedia>
            <Avatar>
              <AvatarImage src={match.image ?? undefined} alt={match.name} />
              <AvatarFallback>{match.name[0]}</AvatarFallback>
            </Avatar>
          </ItemMedia>
          <ItemContent>
            <ItemTitle>{match.name}</ItemTitle>
            {match.username ? <ItemDescription>@{match.username}</ItemDescription> : null}
          </ItemContent>
          <ItemActions className="text-right">
            <div>
              <p className="text-lg font-bold">{match.sharedCount}</p>
              <p className="text-xs text-muted-foreground">shared artists</p>
            </div>
          </ItemActions>
        </Item>
      </CardContent>
    </Card>
  );
}
