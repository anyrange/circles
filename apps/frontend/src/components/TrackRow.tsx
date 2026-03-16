import { Link } from "@tanstack/react-router";
import { Music2 } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type TrackRowProps = {
  title: ReactNode;
  subtitle?: ReactNode;
  imageUrl?: string | null;
  leading?: string | number | null;
  trailing?: string | null;
  className?: string;
  compact?: boolean;
  to?: string;
};

export function TrackRow({
  title,
  subtitle,
  imageUrl,
  leading,
  trailing,
  className,
  compact = false,
  to,
}: TrackRowProps) {
  const content = (
    <div
      className={cn(
        "group flex items-center gap-3 rounded-2xl border border-border/60 bg-card/40 px-3 transition-colors hover:bg-card/80",
        compact ? "py-2" : "py-3",
        className,
      )}
    >
      {leading !== undefined && leading !== null ? (
        <div className="w-14 shrink-0 text-right text-xs font-medium whitespace-nowrap text-muted-foreground tabular-nums">
          {leading}
        </div>
      ) : null}

      <div
        className={cn(
          "flex shrink-0 items-center justify-center overflow-hidden rounded-xl bg-muted text-muted-foreground",
          compact ? "size-10 rounded-lg" : "size-12",
        )}
      >
        {imageUrl ? (
          <img src={imageUrl} alt="" className="size-full object-cover" />
        ) : (
          <Music2 className={compact ? "size-4" : "size-5"} />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "truncate font-medium text-foreground",
            compact ? "text-sm" : "text-[0.95rem]",
          )}
        >
          {title}
        </p>
        {subtitle ? <p className="truncate text-xs text-muted-foreground">{subtitle}</p> : null}
      </div>

      {trailing ? (
        <div className="shrink-0 text-xs font-medium whitespace-nowrap text-muted-foreground tabular-nums">
          {trailing}
        </div>
      ) : null}
    </div>
  );

  if (!to) {
    return content;
  }

  return (
    <Link to={to as never} className="block">
      {content}
    </Link>
  );
}
