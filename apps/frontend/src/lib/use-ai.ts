import { useMutation } from "@tanstack/react-query";

import { api } from "@/lib/api";

export function useTasteDNA() {
  return useMutation({
    mutationFn: async () => {
      const res = await api.me.ai["taste-dna"].$post();
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });
}

export function useRoast() {
  return useMutation({
    mutationFn: async () => {
      const res = await api.me.ai.roast.$post();
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });
}

export function useSceneReport() {
  return useMutation({
    mutationFn: async () => {
      const res = await api.me.ai["scene-report"].$post();
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });
}
