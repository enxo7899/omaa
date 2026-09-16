"use client";

import { useI18n } from "@/lib/i18n";

/** Wraps skeletons and announces loading to assistive tech. */
export function LoadingRegion({ children, className }: { children: React.ReactNode; className?: string }) {
  const { t } = useI18n();
  return (
    <div role="status" aria-live="polite" aria-busy="true" className={className}>
      <span className="sr-only">{t.common.loading}</span>
      {children}
    </div>
  );
}
