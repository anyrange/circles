import { useMutation } from "@tanstack/react-query";
import { parseResponse } from "hono/client";

import { api } from "@/lib/api";

export function useTasteDNA() {
  return useMutation({
    mutationFn: () => parseResponse(api.me.ai["taste-dna"].$post()),
  });
}

export function useRoast() {
  return useMutation({
    mutationFn: () => parseResponse(api.me.ai.roast.$post()),
  });
}

export function useSceneReport() {
  return useMutation({
    mutationFn: () => parseResponse(api.me.ai["scene-report"].$post()),
  });
}
