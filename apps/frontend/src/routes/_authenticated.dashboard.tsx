import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { api } from "@/lib/api";
import { authClient } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  const navigate = useNavigate();

  const { data: me, isLoading } = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const res = await api.me.$get();
      if (!res.ok) throw new Error("Failed to fetch profile");
      return res.json();
    },
  });

  const { data: stats } = useQuery({
    queryKey: ["me", "stats"],
    queryFn: async () => {
      const res = await api.me.stats.$get();
      if (!res.ok) throw new Error("Failed to fetch stats");
      return res.json();
    },
  });

  async function logout() {
    await authClient.signOut();
    await navigate({ to: "/" });
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {me?.avatarUrl && (
            <img src={me.avatarUrl} alt={me.displayName ?? ""} className="size-10 rounded-full" />
          )}
          <div>
            <p className="font-semibold">{me?.displayName ?? "Unknown"}</p>
            <p className="text-sm text-muted-foreground">{me?.email}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          Sign out
        </button>
      </div>

      {stats && (
        <div className="space-y-8">
          <section>
            <h2 className="mb-4 text-sm font-semibold tracking-widest uppercase opacity-50">
              Top Tracks
            </h2>
            <ol className="space-y-2">
              {stats.topTracks.map((item, i) => (
                <li key={item.track.id} className="flex items-center gap-3">
                  <span className="w-5 text-right text-sm text-muted-foreground">{i + 1}</span>
                  <span className="flex-1 truncate">{item.track.name}</span>
                  <span className="text-sm text-muted-foreground">{item.playCount} plays</span>
                </li>
              ))}
            </ol>
          </section>

          <section>
            <h2 className="mb-4 text-sm font-semibold tracking-widest uppercase opacity-50">
              Top Artists
            </h2>
            <ol className="space-y-3">
              {stats.topArtists.map((item, i) => (
                <li key={item.artist.id} className="flex items-center gap-3">
                  <span className="w-5 text-right text-sm text-muted-foreground">{i + 1}</span>
                  {item.artist.images?.[0] && (
                    <img
                      src={item.artist.images[0].url}
                      alt={item.artist.name}
                      className="size-8 rounded-full object-cover"
                    />
                  )}
                  <span className="flex-1 truncate">{item.artist.name}</span>
                  <span className="text-sm text-muted-foreground">{item.playCount} plays</span>
                </li>
              ))}
            </ol>
          </section>
        </div>
      )}
    </div>
  );
}
