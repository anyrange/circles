import { Music2 } from "lucide-react";
import { Slot } from "radix-ui";
import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/utils";

type TrackRowRootProps = ComponentPropsWithoutRef<"div"> & {
  asChild?: boolean;
};

function TrackRowRoot({ asChild, className, ...props }: TrackRowRootProps) {
  const Comp = asChild ? Slot.Root : "div";

  return (
    <Comp
      data-slot="track-row"
      data-interactive={asChild ? "" : undefined}
      className={cn(
        "group/track-row flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-muted/50 data-[interactive]:hover:bg-muted/50",
        className,
      )}
      {...props}
    />
  );
}

function TrackRowCompact({ asChild, className, ...props }: TrackRowRootProps) {
  return (
    <TrackRowRoot
      asChild={asChild}
      className={cn(
        "py-1.5 [&_[data-slot=track-row-artwork]]:size-10 [&_[data-slot=track-row-artwork]>svg]:size-4 [&_[data-slot=track-row-title]]:text-sm",
        className,
      )}
      {...props}
    />
  );
}

function TrackRowLeading({ className, ...props }: ComponentPropsWithoutRef<"div">) {
  return (
    <div
      data-slot="track-row-leading"
      className={cn(
        "w-14 shrink-0 text-right text-xs font-medium whitespace-nowrap text-muted-foreground tabular-nums",
        className,
      )}
      {...props}
    />
  );
}

function TrackRowArtwork({ children, className, ...props }: ComponentPropsWithoutRef<"div">) {
  return (
    <div
      data-slot="track-row-artwork"
      className={cn(
        "flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted text-muted-foreground [&_svg:not([class*='size-'])]:size-5",
        className,
      )}
      {...props}
    >
      {children ?? <Music2 className="size-5" />}
    </div>
  );
}

function TrackRowImage(props: ComponentPropsWithoutRef<"img">) {
  return <img className="size-full object-cover" {...props} />;
}

function TrackRowContent({ className, ...props }: ComponentPropsWithoutRef<"div">) {
  return (
    <div data-slot="track-row-content" className={cn("min-w-0 flex-1", className)} {...props} />
  );
}

function TrackRowTitle({ className, ...props }: ComponentPropsWithoutRef<"p">) {
  return (
    <p
      data-slot="track-row-title"
      className={cn(
        "truncate text-[0.95rem] font-medium text-foreground group-data-[compact]/track-row:text-sm",
        className,
      )}
      {...props}
    />
  );
}

function TrackRowSubtitle({ className, ...props }: ComponentPropsWithoutRef<"p">) {
  return (
    <p
      data-slot="track-row-subtitle"
      className={cn("truncate text-xs text-muted-foreground", className)}
      {...props}
    />
  );
}

function TrackRowTrailing({ className, ...props }: ComponentPropsWithoutRef<"div">) {
  return (
    <div
      data-slot="track-row-trailing"
      className={cn(
        "shrink-0 text-xs font-medium whitespace-nowrap text-muted-foreground tabular-nums",
        className,
      )}
      {...props}
    />
  );
}

export const TrackRow = Object.assign(TrackRowRoot, {
  Compact: TrackRowCompact,
  Leading: TrackRowLeading,
  Artwork: TrackRowArtwork,
  Image: TrackRowImage,
  Content: TrackRowContent,
  Title: TrackRowTitle,
  Subtitle: TrackRowSubtitle,
  Trailing: TrackRowTrailing,
});
