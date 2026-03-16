import { createFileRoute } from "@tanstack/react-router";

import { TimeMachineView } from "@/components/TimeMachineView";

export const Route = createFileRoute("/_authenticated/time-machine")({
  component: TimeMachinePage,
});

function TimeMachinePage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-12">
      <div>
        <h1 className="text-xl font-semibold">Time Machine</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          See what you were listening to on this day in previous years.
        </p>
      </div>

      <TimeMachineView />
    </div>
  );
}
