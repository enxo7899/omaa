"use client";

import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { LoadingRegion } from "@/components/shared/loading-region";
import { PageHeader } from "@/components/shared/page-header";
import { RegionTag } from "@/components/shared/region-dot";
import { TierBadge } from "@/components/shared/tier-badge";
import { Money } from "@/components/shared/money";
import { useI18n } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import { initials } from "@/lib/utils-text";

export default function OwnerAgentsPage() {
  const { t, tr } = useI18n();
  const { loadState, data, agentClients, agentOrders, progressFor } = useStore();
  if (loadState !== "ready" || !data) return <Sk />;
  const days = data.config.windowDays;
  return (
    <div className="animate-swap">
      <PageHeader title={t.owner.agentsTitle} subtitle={t.owner.agentsSubtitle} />
      <ul className="mt-6 grid gap-4 lg:grid-cols-3">
        {data.agents.map((a) => {
          const clients = agentClients(a.id);
          const ps = clients.map((c) => progressFor(c.id));
          const revenue = ps.reduce((s, p) => s + p.spend, 0);
          const pending = agentOrders(a.id).filter((o) => o.status === "pending").length;
          const counts = data.config.tiers.map((tier) => ({ tier, n: ps.filter((p) => p.tier?.id === tier.id).length }));
          const none = ps.filter((p) => !p.tier).length;
          return (
            <li key={a.id} className="rounded-card border border-line bg-white p-5 shadow-rest">
              <div className="flex items-center gap-3">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-forest-tint text-sm font-bold text-forest">{initials(a.name)}</span>
                <div className="min-w-0">
                  <div className="truncate text-base font-bold text-ink">{a.name}</div>
                  <RegionTag region={a.region} className="mt-0.5" />
                </div>
              </div>
              <dl className="mt-5 grid grid-cols-3 gap-3 border-y border-line py-4">
                <div>
                  <dt className="text-xs text-ink-3">{t.owner.colClients}</dt>
                  <dd className="mt-0.5 text-lg font-extrabold text-ink tnum">{clients.length}</dd>
                </div>
                <div>
                  <dt className="text-xs text-ink-3">{tr(t.agent.kpiRevenue, { days })}</dt>
                  <dd className="mt-0.5 text-lg font-extrabold text-ink tnum">
                    <Money amount={revenue} />
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-ink-3">{t.owner.colPending}</dt>
                  <dd className={`mt-0.5 text-lg font-extrabold tnum ${pending ? "text-paprika" : "text-ink"}`}>{pending}</dd>
                </div>
              </dl>
              <ul className="mt-4 flex flex-wrap gap-2">
                {[...counts].reverse().map(({ tier, n }) => (
                  <li key={tier.id} className="flex items-center gap-1.5 text-xs text-ink-2">
                    <TierBadge tier={tier} size="sm" />
                    <span className="font-semibold tnum">{n}</span>
                  </li>
                ))}
                <li className="flex items-center gap-1.5 text-xs text-ink-2">
                  <TierBadge tier={null} size="sm" />
                  <span className="font-semibold tnum">{none}</span>
                </li>
              </ul>
              <Link href={`/owner/clients?region=${a.region}`} className="mt-5 flex h-10 items-center gap-1 text-sm font-semibold text-forest hover:underline">
                {t.nav.owner.clients}
                <ArrowRightIcon className="size-4" aria-hidden="true" />
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Sk() {
  return (
    <LoadingRegion>
      <Skeleton className="h-7 w-32" />
      <Skeleton className="mt-3 h-4 w-48" />
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-[268px] rounded-card" />
        ))}
      </div>
    </LoadingRegion>
  );
}
