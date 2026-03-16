import { createFileRoute } from "@tanstack/react-router";

import { RoastCard } from "@/components/discover/RoastCard";
import { SceneReportCard } from "@/components/discover/SceneReportCard";
import { TasteDNACard } from "@/components/discover/TasteDNACard";

export const Route = createFileRoute("/_authenticated/tools")({
  component: DiscoverPage,
});

function DiscoverPage() {
  return (
    <div className="space-y-8 px-6 py-8">
      <div>
        <h1 className="text-2xl font-bold">Discover</h1>
        <p className="text-sm text-muted-foreground">
          Weekly insights into your listening identity.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <TasteDNACard />
        <RoastCard />
        <SceneReportCard />
      </div>
    </div>
  );
}
