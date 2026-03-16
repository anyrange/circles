import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useFollowingActivity } from "@/lib/use-social";

export function FeedSection() {
  const { data, isLoading } = useFollowingActivity();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <FeedSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!data || data.plays.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card px-5 py-8 text-center">
        <p className="text-sm text-muted-foreground">
          No activity yet. Follow people to see what they're listening to.
        </p>
      </div>
    );
  }

  // Group consecutive plays by the same user
  const grouped = groupByUser(data.plays);

  return (
    <div className="space-y-3">
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
  user: { id: string; name: string; username: string | null; image: string | null };
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
      current = { user: play.user, plays: [play], from: play.playedAt, to: play.playedAt };
      groups.push(current);
    }
  }

  return groups.slice(0, 20);
}

function FeedGroup({ group }: { group: Group }) {
  const relTime = relativeTime(group.from);

  return (
    <div className="rounded-xl border border-border bg-card px-4 py-3">
      <div className="mb-3 flex items-center gap-3">
        <Avatar className="size-8">
          <AvatarImage src={group.user.image ?? undefined} />
          <AvatarFallback className="text-xs">{group.user.name[0]}</AvatarFallback>
        </Avatar>
        <div>
          <span className="text-sm font-semibold">{group.user.name}</span>
          <span className="ml-1.5 text-sm text-muted-foreground">
            listened to {group.plays.length} track{group.plays.length > 1 ? "s" : ""}
          </span>
        </div>
        <span className="ml-auto text-xs text-muted-foreground">{relTime}</span>
      </div>

      <div className="space-y-1.5 pl-11">
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
    </div>
  );
}

function FeedSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card px-4 py-3">
      <div className="mb-3 flex items-center gap-3">
        <Skeleton className="size-8 rounded-full" />
        <Skeleton className="h-4 w-48" />
      </div>
      <div className="space-y-2 pl-11">
        {[1, 2].map((i) => (
          <div key={i} className="flex items-center gap-2">
            <Skeleton className="size-7 rounded" />
            <Skeleton className="h-4 w-40" />
          </div>
        ))}
      </div>
    </div>
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
