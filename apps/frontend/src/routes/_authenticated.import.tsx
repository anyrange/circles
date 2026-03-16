import { createFileRoute } from "@tanstack/react-router";

import { ImportUploader } from "@/components/ImportUploader";

export const Route = createFileRoute("/_authenticated/import")({
  component: ImportPage,
});

function ImportPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-12">
      <div>
        <h1 className="text-xl font-semibold">Import Spotify History</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Upload your Spotify GDPR data export to import years of listening history. Request your
          data in Spotify at{" "}
          <a
            className="font-medium text-foreground underline underline-offset-4"
            href="https://www.spotify.com/us/account/privacy/"
            rel="noreferrer"
            target="_blank"
          >
            Settings → Privacy
          </a>{" "}
          and then choose <span className="font-medium">Download your data</span>.
        </p>
      </div>

      <ImportUploader />
    </div>
  );
}
