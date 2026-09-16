"use client";

import * as React from "react";
import type { LoyaltyConfig } from "@/lib/types";
import { useI18n } from "@/lib/i18n";
import { formatLek } from "@/lib/format";
import { cn } from "cn";

/**
 * The one bold element of the app. A wheat ring that fills toward the top
 * tier, with tick marks at every threshold so the math is visibly honest.
 */
export function ProgressRing({
  spend,
  config,
  size = 248,
  stroke = 18,
  className,
  children,
}: {
  spend: number;
  config: LoyaltyConfig;
  size?: number;
  stroke?: number;
  className?: string;
  children?: React.ReactNode;
}) {
  const { t, tr, lang } = useI18n();
  const top = config.tiers[config.tiers.length - 1]?.min ?? 1;
  const target = Math.max(0, Math.min(1, spend / top));
  const [shown, setShown] = React.useState(0);

  // Animate from 0 on first paint, then from the previous value on updates.
  React.useEffect(() => {
    const id = window.requestAnimationFrame(() => setShown(target));
    return () => window.cancelAnimationFrame(id);
  }, [target]);

  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - shown);
  // Tick marks at intermediate thresholds; the top tier is the ring's end itself.
  const ticks = config.tiers.map((tier) => ({ id: tier.id, frac: Math.min(1, tier.min / top) })).filter((tick) => tick.frac < 1);

  return (
    <div className={cn("relative", className)} style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label={tr(t.a11y.progressRing, { pct: `${Math.round(target * 100)}%` })}
        className="block -rotate-90"
      >
        <title>{`${formatLek(spend, lang)} / ${formatLek(top, lang)}`}</title>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--paper-3)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--wheat)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          className="ring-progress"
        />
        {ticks.map((tick) => {
          const angle = tick.frac * 2 * Math.PI;
          const inner = r - stroke / 2 - 3;
          const outer = r + stroke / 2 + 3;
          const x1 = size / 2 + inner * Math.cos(angle);
          const y1 = size / 2 + inner * Math.sin(angle);
          const x2 = size / 2 + outer * Math.cos(angle);
          const y2 = size / 2 + outer * Math.sin(angle);
          const reached = target >= tick.frac - 0.0001;
          return (
            <line
              key={tick.id}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={reached ? "var(--wheat-3)" : "var(--ink-4)"}
              strokeWidth={2}
              strokeLinecap="round"
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">{children}</div>
    </div>
  );
}
