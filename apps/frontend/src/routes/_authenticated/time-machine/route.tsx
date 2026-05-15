import { createFileRoute } from "@tanstack/react-router";

import { Page, PageDescription, PageHeader, PageTitle } from "@/components/page-shell";
import { TimeMachineView } from "@/components/time-machine-view";

export const Route = createFileRoute("/_authenticated/time-machine")({
  component: TimeMachinePage,
});

function TimeMachinePage() {
  return (
    <Page>
      <PageHeader>
        <PageTitle>Time Machine</PageTitle>
        <PageDescription>
          See what you were listening to on this day in previous years.
        </PageDescription>
      </PageHeader>

      <TimeMachineView />
    </Page>
  );
}
