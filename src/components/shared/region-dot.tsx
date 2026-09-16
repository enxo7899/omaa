"use client";

import { useI18n } from "@/lib/i18n";
import type { Region } from "@/lib/types";
import { cn } from "cn";

const colors: Record<Region, string> = {
  tirane: "bg-region-tirane",
  jug: "bg-region-jug",
  veri: "bg-region-veri",
};

export function RegionDot({ region, className }: { region: Region; className?: string }) {
  const { t, tr } = useI18n();
  return (
    <span
      role="img"
      aria-label={tr(t.a11y.regionDot, { region: t.regions[region] })}
      className={cn("inline-block size-2 shrink-0 rounded-full", colors[region], className)}
    />
  );
}

export function RegionTag({ region, className, withCity }: { region: Region; className?: string; withCity?: string }) {
  const { t } = useI18n();
  return (
    <span className={cn("inline-flex items-center gap-2 text-xs font-medium text-ink-2", className)}>
      <RegionDot region={region} />
      <span>
        {withCity && withCity !== t.regions[region] ? `${withCity} · ` : ""}
        {t.regions[region]}
      </span>
    </span>
  );
}
