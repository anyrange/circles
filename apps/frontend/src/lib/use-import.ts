import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api";

export function useImportStatus() {
  return useQuery({
    queryKey: ["me", "import", "status"],
    queryFn: async () => {
      const res = await api.me.import.status.$get();
      if (!res.ok) throw new Error("Failed to fetch import status");
      return res.json();
    },
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
      // Get presigned URL
      const uploadRes = await api.me.import.upload.$post();
      if (!uploadRes.ok) throw new Error("Failed to get upload URL");
      const { uploadUrl, s3Key } = await uploadRes.json();

      // Upload directly to S3
      const s3Res = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
      });
      if (!s3Res.ok) throw new Error("Failed to upload file");

      // Trigger processing
      const processRes = await api.me.import.process.$post({ json: { s3Key } });
      if (!processRes.ok) throw new Error("Failed to trigger processing");
      return processRes.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["me", "import", "status"] }),
  });
}
