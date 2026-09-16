"use client";

import { MinusIcon, PlusIcon } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { cn } from "cn";

export function QtyStepper({
  value,
  onChange,
  min = 0,
  max = 999,
  className,
  size = "md",
  label,
}: {
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
  className?: string;
  size?: "md" | "lg";
  label?: string;
}) {
  const { t } = useI18n();
  const h = size === "lg" ? "h-12" : "h-11";
  const btn = cn(
    "flex shrink-0 items-center justify-center rounded-control text-ink transition-colors hover:bg-paper-2 disabled:opacity-40 disabled:hover:bg-transparent",
    size === "lg" ? "size-12" : "size-11",
  );
  return (
    <div className={cn("inline-flex items-center rounded-control border border-line-strong bg-white", h, className)} role="group" aria-label={label ?? t.catalog.qty}>
      <button type="button" className={btn} onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min} aria-label={t.catalog.decrease}>
        <MinusIcon className="size-5" strokeWidth={2} aria-hidden="true" />
      </button>
      <input
        type="number"
        inputMode="numeric"
        aria-label={t.catalog.qty}
        className="h-full w-12 border-x border-line bg-transparent text-center text-base font-semibold tnum outline-none focus-visible:bg-paper-2"
        value={value}
        min={min}
        max={max}
        onChange={(e) => {
          const n = parseInt(e.target.value, 10);
          onChange(Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : min);
        }}
      />
      <button type="button" className={btn} onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max} aria-label={t.catalog.increase}>
        <PlusIcon className="size-5" strokeWidth={2} aria-hidden="true" />
      </button>
    </div>
  );
}
