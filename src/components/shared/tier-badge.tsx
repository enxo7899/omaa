"use client";

import { useI18n } from "@/lib/i18n";
import type { Tier, TierId } from "@/lib/types";
import { cn } from "cn";

const styles: Record<TierId | "none", { wrap: string; dot: string }> = {
  ar: { wrap: "bg-wheat-tint text-wheat-3", dot: "bg-wheat" },
  argjend: { wrap: "bg-silver-tint text-silver-2", dot: "bg-silver" },
  bronz: { wrap: "bg-bronze-tint text-bronze-2", dot: "bg-bronze" },
  none: { wrap: "bg-paper-2 text-ink-3", dot: "bg-ink-4" },
};

export function TierBadge({
  tier,
  size = "md",
  className,
  showDiscount,
}: {
  tier: Tier | null;
  size?: "sm" | "md" | "lg";
  className?: string;
  showDiscount?: boolean;
}) {
  const { t, tr } = useI18n();
  const key = tier?.id ?? "none";
  const s = styles[key];
  const label = tier ? t.tiers[tier.id] : t.tiers.none;
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-2 rounded-control font-semibold whitespace-nowrap tnum",
        size === "sm" && "h-6 px-2 text-xs",
        size === "md" && "h-8 px-3 text-xs",
        size === "lg" && "h-10 px-4 text-sm",
        s.wrap,
        className,
      )}
    >
      <span className={cn("inline-block rounded-full", size === "sm" ? "size-1.5" : "size-2", s.dot)} aria-hidden="true" />
      {label}
      {showDiscount && tier && <span className="font-medium opacity-80">· {tr(t.tiers.discountOf, { pct: tier.discountPercent })}</span>}
    </span>
  );
}

export function tierColorClass(id: TierId | null | undefined) {
  if (id === "ar") return "text-wheat-3";
  if (id === "argjend") return "text-silver-2";
  if (id === "bronz") return "text-bronze-2";
  return "text-ink-3";
}
