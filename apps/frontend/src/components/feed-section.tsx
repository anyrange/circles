import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { Skeleton } from "@/components/ui/skeleton";
import { useFollowingActivity } from "@/lib/queries/social";

export function FeedSection() {
  const { data, isLoading } = useFollowingActivity();

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        {[1, 2, 3].map((i) => (
          <FeedSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!data || data.plays.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyTitle>No activity yet</EmptyTitle>
          <EmptyDescription>Follow people to see what they're listening to.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  // Group consecutive plays by the same user
  const grouped = groupByUser(data.plays);

  return (
    <div className="flex flex-col gap-3">
      {grouped.map((group, i) => (
        <FeedGroup key={i} group={group} />
      ))}
    </div>
  );
}

interface Play {
  playedAt: string;
  userId: string;
  track: { id: string; spotifyId: string; name: string };
  user: {
    id: string;
    name: string;
    username: string | null;
    image: string | null;
  };
}

interface Group {
  user: Play["user"];
  plays: Play[];
  from: string;
  to: string;
}

function groupByUser(plays: Play[]): Group[] {
  const groups: Group[] = [];
  let current: Group | null = null;

  for (const play of plays) {
    if (current && current.user.id === play.userId) {
      current.plays.push(play);
      current.to = play.playedAt;
    } else {
      current = {
        user: play.user,
        plays: [play],
        from: play.playedAt,
        to: play.playedAt,
      };
      groups.push(current);
    }
  }

  return groups.slice(0, 20);
}

function FeedGroup({ group }: { group: Group }) {
  const relTime = relativeTime(group.from);

  return (
    <Card>
      <CardContent className="flex flex-col gap-3">
        <Item className="p-0">
          <ItemMedia>
            <Avatar>
              <AvatarImage src={group.user.image ?? undefined} />
              <AvatarFallback>{group.user.name[0]}</AvatarFallback>
            </Avatar>
          </ItemMedia>
          <ItemContent>
            <ItemTitle>{group.user.name}</ItemTitle>
            <ItemDescription>
              listened to {group.plays.length} track
              {group.plays.length > 1 ? "s" : ""}
            </ItemDescription>
          </ItemContent>
          <ItemActions className="text-xs text-muted-foreground">{relTime}</ItemActions>
        </Item>

        <div className="flex flex-col gap-1.5 pl-11">
          {group.plays.slice(0, 5).map((play, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="flex size-7 shrink-0 items-center justify-center rounded bg-muted">
                <span className="text-[10px] text-muted-foreground">♪</span>
              </div>
              <p className="truncate text-sm">{play.track.name}</p>
            </div>
          ))}
          {group.plays.length > 5 && (
            <p className="text-xs text-muted-foreground">+{group.plays.length - 5} more</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function FeedSkeleton() {
  return (
    <Card>
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <Skeleton className="size-8 rounded-full" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="flex flex-col gap-2 pl-11">
          {[1, 2].map((i) => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton className="size-7 rounded" />
              <Skeleton className="h-4 w-40" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}
