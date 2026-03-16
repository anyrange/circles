import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";

export const Route = createFileRoute("/_authenticated/u/$username")({
  component: ProfilePage,
});

function ProfilePage() {
  const { username } = Route.useParams();

  const { data: user, isLoading } = useQuery({
    queryKey: ["users", "by-username", username],
    queryFn: async () => {
      const res = await api.users["by-username"][":username"].$get({ param: { username } });
      if (!res.ok) throw new Error("User not found");
      return res.json();
    },
  });

  const { data: extended } = useQuery({
    queryKey: ["users", user?.id, "stats", "extended"],
    queryFn: async () => {
      const res = await api.users[":id"]["stats"]["extended"].$get({
        param: { id: user!.id },
        query: { range: "all" },
      });
      if (!res.ok) throw new Error("Failed to fetch stats");
      return res.json();
    },
    enabled: !!user?.id,
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-12">
        <div className="flex items-center gap-4">
          <Skeleton className="size-16 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) return <div className="mx-auto max-w-3xl px-4 py-12">User not found.</div>;

  const joinedYear = new Date(user.createdAt).getFullYear();

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-12">
      <div className="flex items-center gap-4">
        <Avatar className="size-16">
          <AvatarImage src={user.avatarUrl ?? undefined} alt={user.displayName} />
          <AvatarFallback>{user.displayName[0]}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-xl font-bold">{user.displayName}</h1>
          {user.username && <p className="text-muted-foreground">@{user.username}</p>}
          {user.bio && <p className="mt-1 text-sm">{user.bio}</p>}
          <p className="mt-1 text-xs text-muted-foreground">
            Member since {joinedYear}
            {extended ? ` · ${extended.totalScrobbles.toLocaleString()} scrobbles` : ""}
          </p>
        </div>
      </div>

      {extended?.topGenres && extended.topGenres.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold tracking-widest uppercase opacity-50">
            Top Genres
          </h2>
          <div className="flex flex-wrap gap-2">
            {extended.topGenres.map((g) => (
              <span key={g.genre} className="rounded-full border px-3 py-1 text-sm capitalize">
                {g.genre}
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
