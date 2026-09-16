"use client";

import { cn } from "cn";

export function SwitchRow({
  checked,
  onChange,
  title,
  body,
  onLabel,
  offLabel,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  title: string;
  body: string;
  onLabel: string;
  offLabel: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <div className="min-w-0">
        <div className="text-sm font-semibold text-ink">{title}</div>
        <div className="mt-0.5 text-xs text-ink-3">{body}</div>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={title}
        onClick={() => onChange(!checked)}
        className={cn(
          "flex h-11 shrink-0 items-center gap-2 rounded-control border px-3 text-xs font-semibold transition-colors",
          checked ? "border-forest bg-forest-tint text-forest" : "border-line-strong bg-white text-ink-3",
        )}
      >
        <span className={cn("relative inline-block h-5 w-9 rounded-full transition-colors", checked ? "bg-forest" : "bg-paper-3")} aria-hidden="true">
          <span className={cn("absolute top-0.5 size-4 rounded-full bg-white shadow-rest transition-transform", checked ? "translate-x-4" : "translate-x-0.5")} />
        </span>
        {checked ? onLabel : offLabel}
      </button>
    </div>
  );
}
