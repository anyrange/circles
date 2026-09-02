import { Slot } from "radix-ui";
import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/utils";

function RankedListRoot({ className, ...props }: ComponentPropsWithoutRef<"ol">) {
  return <ol className={cn("flex flex-col border-y border-border/70", className)} {...props} />;
}

function RankedListItem({ className, ...props }: ComponentPropsWithoutRef<"li">) {
  return <li className={cn("border-b border-border/70 last:border-b-0", className)} {...props} />;
}

function RankedListLink({ className, ...props }: ComponentPropsWithoutRef<typeof Slot.Root>) {
  return (
    <Slot.Root
      className={cn(
        "grid min-h-16 grid-cols-[2rem_2.5rem_minmax(0,1fr)] items-center gap-3 py-2 transition-colors hover:bg-muted/40 sm:grid-cols-[2.5rem_2.5rem_minmax(0,1fr)_minmax(10rem,0.35fr)] sm:gap-3",
        className,
      )}
      {...props}
    />
  );
}

function RankedListRank({ className, ...props }: ComponentPropsWithoutRef<"div">) {
  return (
    <div
      className={cn(
        "text-right text-sm text-muted-foreground tabular-nums sm:text-base",
        className,
      )}
      {...props}
    />
  );
}

function RankedListArtwork({ children, className, ...props }: ComponentPropsWithoutRef<"div">) {
  return (
    <div
      className={cn(
        "flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted text-muted-foreground",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function RankedListImage(props: ComponentPropsWithoutRef<"img">) {
  return <img className="size-full object-cover" {...props} />;
}

function RankedListBody({ className, ...props }: ComponentPropsWithoutRef<"div">) {
  return <div className={cn("min-w-0", className)} {...props} />;
}

function RankedListTitle({ className, ...props }: ComponentPropsWithoutRef<"p">) {
  return (
    <p className={cn("truncate text-base font-semibold text-foreground", className)} {...props} />
  );
}

function RankedListSubtitle({ className, ...props }: ComponentPropsWithoutRef<"p">) {
  return <p className={cn("truncate text-sm text-muted-foreground", className)} {...props} />;
}

function RankedListMetric({ value, max }: { value: number; max: number }) {
  const width = max > 0 ? (value / max) * 100 : 0;

  return (
    <div className="hidden min-w-0 flex-col gap-1.5 sm:flex">
      <p className="text-right text-xs font-medium text-muted-foreground tabular-nums">
        {value.toLocaleString()} plays
      </p>
      <div className="h-1 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-chart-1" style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

export const RankedList = Object.assign(RankedListRoot, {
  Artwork: RankedListArtwork,
  Body: RankedListBody,
  Item: RankedListItem,
  Link: RankedListLink,
  Image: RankedListImage,
  Metric: RankedListMetric,
  Rank: RankedListRank,
  Subtitle: RankedListSubtitle,
  Title: RankedListTitle,
});
