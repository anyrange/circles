import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { parseResponse } from "hono/client";

import { api } from "@/lib/api";

export function useImportStatus() {
  return useQuery({
    queryKey: ["me", "import", "status"],
    queryFn: () => parseResponse(api.me.import.status.$get()),
    refetchInterval: (query) => {
      const data = query.state.data;
      if (data && "status" in data && data.status === "processing") return 3000;
      return false;
    },
  });
}

export function useTriggerImport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      const { uploadUrl, jobId } = await parseResponse(api.me.import.upload.$post());

      const s3Res = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
      });
      if (!s3Res.ok) throw new Error("Failed to upload file");

      return parseResponse(api.me.import.process.$post({ json: { jobId } }));
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["me", "import", "status"] }),
  });
}
