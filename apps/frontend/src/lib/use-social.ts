import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api";

export function useLeaderboard(period: "week" | "all" = "all") {
  return useQuery({
    queryKey: ["leaderboard", period],
    queryFn: async () => {
      const res = await api.leaderboard.$get({ query: { period } });
      if (!res.ok) throw new Error("Failed to fetch leaderboard");
      return res.json();
    },
  });
}

export function useFollows() {
  return useQuery({
    queryKey: ["me", "follows"],
    queryFn: async () => {
      const res = await api.me.follows.$get();
      if (!res.ok) throw new Error("Failed to fetch follows");
      return res.json();
    },
  });
}

export function useFollowingActivity() {
  return useQuery({
    queryKey: ["me", "following-activity"],
    queryFn: async () => {
      const res = await api.me["following-activity"].$get();
      if (!res.ok) throw new Error("Failed to fetch activity");
      return res.json();
    },
  });
}

export function useMusicMatches() {
  return useQuery({
    queryKey: ["me", "music-matches"],
    queryFn: async () => {
      const res = await api.me["music-matches"].$get();
      if (!res.ok) throw new Error("Failed to fetch matches");
      return res.json();
    },
  });
}

export function useFollow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      const res = await api.me.follows[":userId"].$post({ param: { userId } });
      if (!res.ok) throw new Error("Failed to follow");
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["me", "follows"] }),
  });
}

export function useUnfollow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      const res = await api.me.follows[":userId"].$delete({ param: { userId } });
      if (!res.ok) throw new Error("Failed to unfollow");
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["me", "follows"] }),
  });
}
