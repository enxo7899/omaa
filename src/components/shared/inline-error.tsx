"use client";

import { TriangleAlertIcon } from "lucide-react";

/** Calm, contextual error: what happened + what to do next. */
export function InlineError({ title, body, actions }: { title: string; body: string; actions?: React.ReactNode }) {
  return (
    <div role="alert" className="rounded-card border border-paprika/30 bg-paprika-tint p-4">
      <div className="flex gap-3">
        <TriangleAlertIcon className="mt-0.5 size-5 shrink-0 text-paprika" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <div className="text-sm font-bold text-paprika-2">{title}</div>
          <p className="mt-1 text-sm text-ink-2">{body}</p>
          {actions && <div className="mt-3 flex flex-wrap gap-2">{actions}</div>}
        </div>
      </div>
    </div>
  );
}
