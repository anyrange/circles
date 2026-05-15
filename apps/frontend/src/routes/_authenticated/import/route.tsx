import { createFileRoute } from "@tanstack/react-router";

import { ImportUploader } from "@/components/import-uploader";
import { Page, PageDescription, PageHeader, PageTitle } from "@/components/page-shell";

export const Route = createFileRoute("/_authenticated/import")({
  component: ImportPage,
});

function ImportPage() {
  return (
    <Page>
      <PageHeader>
        <PageTitle>Import Spotify history</PageTitle>
        <PageDescription>
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
        </PageDescription>
      </PageHeader>

      <ImportUploader />
    </Page>
  );
}
