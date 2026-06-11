import { createFileRoute } from "@tanstack/react-router";

import { ImportUploader } from "@/components/import-uploader";
import { Page, PageDescription, PageHeader, PageSection, PageTitle } from "@/components/page-shell";

export const Route = createFileRoute("/_authenticated/data/import")({
  component: ImportPage,
});

function ImportPage() {
  return (
    <Page className="max-w-6xl">
      <PageHeader>
        <PageTitle>Import Spotify History</PageTitle>
        <PageDescription>
          Upload your Spotify GDPR data export to refresh your listening history.
        </PageDescription>
      </PageHeader>

      <PageSection>
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-semibold">Spotify export</h2>
          <p className="text-sm text-muted-foreground">
            Request it in Spotify at{" "}
            <span className="font-medium text-foreground">Settings - Privacy</span>, then choose
            Download your data.
          </p>
        </div>
        <ImportUploader />
      </PageSection>
    </Page>
  );
}
