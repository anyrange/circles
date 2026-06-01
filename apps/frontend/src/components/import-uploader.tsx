import { useCallback, useState } from "react";

import { Progress } from "@/components/ui/progress";
import { useImportStatus, useTriggerImport } from "@/lib/queries/imports";
import { cn } from "@/lib/utils";

export function ImportUploader() {
  const [dragging, setDragging] = useState(false);
  const trigger = useTriggerImport();
  const { data: status } = useImportStatus();

  const handleFile = useCallback(
    (file: File) => {
      trigger.mutate(file);
    },
    [trigger],
  );

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const isProcessing = status && "status" in status && status.status === "processing";
  const isCompleted = status && "status" in status && status.status === "completed";
  const isFailed = status && "status" in status && status.status === "failed";

  const progress =
    status && "totalTracks" in status && status.totalTracks && status.importedTracks
      ? Math.round((status.importedTracks / status.totalTracks) * 100)
      : 0;

  return (
    <div className="flex flex-col gap-4">
      <div
        onDrop={onDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        className={cn(
          "flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-colors",
          dragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50",
        )}
        onClick={() => document.getElementById("import-file-input")?.click()}
      >
        <p className="font-medium">Drop your Spotify export here</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Upload the .zip or JSON file from your Spotify data export
        </p>
        <input
          id="import-file-input"
          type="file"
          accept=".zip,.json"
          className="hidden"
          onChange={onInputChange}
        />
      </div>

      {trigger.isPending && <p className="text-sm text-muted-foreground">Uploading...</p>}

      {isProcessing && (
        <div className="flex flex-col gap-2">
          <div className="flex justify-between text-sm">
            <span>Processing...</span>
            {status && "importedTracks" in status && (
              <span>
                {status.importedTracks ?? 0} / {status.totalTracks ?? "?"} tracks
              </span>
            )}
          </div>
          <Progress value={progress} />
        </div>
      )}

      {isCompleted && (
        <div className="rounded-lg bg-muted p-3 text-sm">
          Import complete! {status && "importedTracks" in status && status.importedTracks} tracks
          imported.
        </div>
      )}

      {isFailed && (
        <div className="rounded-lg bg-muted p-3 text-sm text-destructive">
          Import failed: {status && "errorMessage" in status && status.errorMessage}
        </div>
      )}
    </div>
  );
}
