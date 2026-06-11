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
        "grid min-h-20 grid-cols-[2.25rem_2.75rem_minmax(0,1fr)] items-center gap-3 py-3 transition-colors hover:bg-muted/40 sm:grid-cols-[3rem_3rem_minmax(0,1fr)_minmax(12rem,0.48fr)] sm:gap-4",
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
        "flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted text-muted-foreground sm:size-12",
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
    <div className="relative hidden h-10 min-w-0 overflow-hidden sm:block">
      <div className="absolute inset-y-0 left-0 bg-chart-1/30" style={{ width: `${width}%` }} />
      <p className="relative flex h-full items-center px-3 text-sm font-medium text-foreground tabular-nums">
        {value.toLocaleString()} plays
      </p>
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
