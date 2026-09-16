import { cn } from "cn";

export interface Kpi {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  tone?: "default" | "loyalty" | "urgent";
}

/** Plain sectioned KPI strip with dividers — deliberately not a row of cards. */
export function KpiStrip({ items, className }: { items: Kpi[]; className?: string }) {
  const cols = items.length >= 4 ? "grid-cols-2 lg:grid-cols-4" : "grid-cols-2 sm:grid-cols-3";
  return (
    <dl className={cn("grid gap-x-4 gap-y-6 rounded-card border border-line bg-white px-4 py-5 shadow-rest lg:gap-x-0 lg:divide-x lg:divide-line lg:px-0", cols, className)}>
      {items.map((k, i) => (
        <div key={i} className="min-w-0 lg:px-6">
          <dt className="text-xs font-medium text-ink-3">{k.label}</dt>
          <dd className={cn("mt-1 text-lg font-extrabold tracking-[-0.01em] whitespace-nowrap tnum lg:text-xl", k.tone === "loyalty" ? "text-wheat-3" : k.tone === "urgent" ? "text-paprika" : "text-ink")}>{k.value}</dd>
          {k.sub && <dd className="mt-0.5 text-xs text-ink-3">{k.sub}</dd>}
        </div>
      ))}
    </dl>
  );
}

export function KpiStripSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className={cn("grid gap-x-4 gap-y-6 rounded-card border border-line bg-white px-4 py-5 lg:px-0", count >= 4 ? "grid-cols-2 lg:grid-cols-4" : "grid-cols-2 sm:grid-cols-3")}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="lg:px-6">
          <div className="skeleton h-3 w-24" />
          <div className="skeleton mt-2 h-7 w-28" />
          <div className="skeleton mt-2 h-3 w-16" />
        </div>
      ))}
    </div>
  );
}
