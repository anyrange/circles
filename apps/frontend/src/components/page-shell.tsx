import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/utils";

export function Page({ className, ...props }: ComponentPropsWithoutRef<"div">) {
  return <div className={cn("flex w-full flex-col gap-8 px-6 py-8", className)} {...props} />;
}

export function PageHeader({ className, ...props }: ComponentPropsWithoutRef<"div">) {
  return <div className={cn("flex flex-col gap-1", className)} {...props} />;
}

export function PageTitle({ className, ...props }: ComponentPropsWithoutRef<"h1">) {
  return <h1 className={cn("text-2xl font-bold", className)} {...props} />;
}

export function PageDescription({ className, ...props }: ComponentPropsWithoutRef<"p">) {
  return <p className={cn("text-sm text-muted-foreground", className)} {...props} />;
}

export function PageSection({ className, ...props }: ComponentPropsWithoutRef<"section">) {
  return <section className={cn("flex flex-col gap-3", className)} {...props} />;
}

export function PageSectionTitle({ className, ...props }: ComponentPropsWithoutRef<"h2">) {
  return <h2 className={cn("text-base font-semibold", className)} {...props} />;
}
