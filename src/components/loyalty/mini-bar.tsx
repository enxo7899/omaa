"use client";

import { cn } from "cn";

/** Compact horizontal bar used in agent and owner lists. */
export function MiniBar({ value, className, tone = "wheat" }: { value: number; className?: string; tone?: "wheat" | "forest" }) {
  const pct = Math.round(Math.max(0, Math.min(1, value)) * 100);
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-paper-3", className)} aria-hidden="true">
      <div className={cn("bar-progress h-full rounded-full", tone === "wheat" ? "bg-wheat" : "bg-forest")} style={{ width: `${pct}%` }} />
    </div>
  );
}
