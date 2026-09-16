"use client";

import { cn } from "cn";

export interface ChipOption<T extends string> {
  value: T;
  label: string;
  count?: number;
}

/** Horizontal, scrollable single-select filter chips. */
export function Chips<T extends string>({
  options,
  value,
  onChange,
  label,
  className,
}: {
  options: ChipOption<T>[];
  value: T;
  onChange: (v: T) => void;
  label: string;
  className?: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className={cn("-mx-4 flex gap-2 overflow-x-auto px-4 py-1 [scrollbar-width:none] lg:mx-0 lg:px-0", className)}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            className={cn(
              "flex h-10 shrink-0 items-center gap-2 rounded-control border px-3.5 text-sm font-semibold whitespace-nowrap transition-colors",
              active ? "border-forest bg-forest text-white" : "border-line-strong bg-white text-ink-2 hover:bg-paper-2",
            )}
          >
            {o.label}
            {typeof o.count === "number" && (
              <span className={cn("rounded-full px-1.5 text-xs tnum", active ? "bg-white/15 text-white" : "bg-paper-2 text-ink-3")}>{o.count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
