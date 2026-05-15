import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { parseResponse } from "hono/client";

import { api } from "@/lib/api";

export function useLeaderboard(period: "week" | "all" = "all") {
  return useQuery({
    queryKey: ["leaderboard", period],
    queryFn: () => parseResponse(api.leaderboard.$get({ query: { period } })),
  });
}

export function useFollows() {
  return useQuery({
    queryKey: ["me", "follows"],
    queryFn: () => parseResponse(api.me.follows.$get()),
  });
}

export function useFollowingActivity() {
  return useQuery({
    queryKey: ["me", "following-activity"],
    queryFn: () => parseResponse(api.me["following-activity"].$get()),
  });
}

export function useMusicMatches() {
  return useQuery({
    queryKey: ["me", "music-matches"],
    queryFn: () => parseResponse(api.me["music-matches"].$get()),
  });
}

export function useFollow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) =>
      parseResponse(api.me.follows[":userId"].$post({ param: { userId } })),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["me", "follows"] }),
  });
}

export function useUnfollow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) =>
      parseResponse(api.me.follows[":userId"].$delete({ param: { userId } })),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["me", "follows"] }),
  });
}
