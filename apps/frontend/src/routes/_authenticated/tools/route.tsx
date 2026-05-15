import { createFileRoute } from "@tanstack/react-router";

import { RoastCard } from "@/components/discover/roast-card";
import { SceneReportCard } from "@/components/discover/scene-report-card";
import { TasteDNACard } from "@/components/discover/taste-dna-card";
import { Page, PageDescription, PageHeader, PageTitle } from "@/components/page-shell";

export const Route = createFileRoute("/_authenticated/tools")({
  component: DiscoverPage,
});

function DiscoverPage() {
  return (
    <Page>
      <PageHeader>
        <PageTitle>Discover</PageTitle>
        <PageDescription>Weekly insights into your listening identity.</PageDescription>
      </PageHeader>

      <div className="grid grid-cols-1 gap-6">
        <TasteDNACard />
        <RoastCard />
        <SceneReportCard />
      </div>
    </Page>
  );
}
