import { useMutation, useQuery } from "@tanstack/react-query";
import { parseResponse } from "hono/client";

import { api } from "@/lib/api";

export function useMeQuery() {
  return useQuery({
    queryKey: ["me"],
    queryFn: () => parseResponse(api.me.$get()),
  });
}

export function useDeleteAccount() {
  return useMutation({
    mutationKey: ["me", "delete-account"],
    mutationFn: () => parseResponse(api.me.$delete()),
  });
}
