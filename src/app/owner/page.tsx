"use client";

import Link from "next/link";
import { ArrowRightIcon, CheckCheckIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { LoadingRegion } from "@/components/shared/loading-region";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader, SectionHeader } from "@/components/shared/page-header";
import { KpiStrip, KpiStripSkeleton } from "@/components/shared/kpi-strip";
import { Money } from "@/components/shared/money";
import { TierBadge } from "@/components/shared/tier-badge";
import { RegionDot, RegionTag } from "@/components/shared/region-dot";
import { StatusPill } from "@/components/shared/status-pill";
import { useI18n } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import { formatDate } from "@/lib/format";
import type { Region } from "@/lib/types";
import { cn } from "cn";

const REGIONS: Region[] = ["tirane", "jug", "veri"];

export default function OwnerOverviewPage() {
  const { t, tr, lang } = useI18n();
  const { loadState, data, today, progressFor, getClient, getAgent } = useStore();
  if (loadState !== "ready" || !data) return <OverviewSkeleton />;

  const { clients, agents, orders, config } = data;
  const progresses = new Map(clients.map((c) => [c.id, progressFor(c.id)]));
  const revenue90 = clients.reduce((s, c) => s + progresses.get(c.id)!.spend, 0);
  const revenueAll = orders.filter((o) => o.status === "confirmed").reduce((s, o) => s + o.total, 0);
  const active = clients.filter((c) => progresses.get(c.id)!.spend > 0).length;
  const withDiscount = clients.filter((c) => progresses.get(c.id)!.tier).length;
  const pending = orders.filter((o) => o.status === "pending");
  const agentsWithPending = new Set(pending.map((o) => o.agentId)).size;

  const tierCounts = [
    ...config.tiers.map((tier) => ({ key: tier.id as string, tier, n: clients.filter((c) => progresses.get(c.id)!.tier?.id === tier.id).length })).reverse(),
    { key: "none", tier: null, n: clients.filter((c) => !progresses.get(c.id)!.tier).length },
  ];
  const barColor = (id: string | null) => (id === "ar" ? "bg-wheat" : id === "argjend" ? "bg-silver" : id === "bronz" ? "bg-bronze" : "bg-ink-4");
  const maxTier = Math.max(1, ...tierCounts.map((x) => x.n));

  const regionRows = REGIONS.map((region) => {
    const agent = agents.find((a) => a.region === region)!;
    const rc = clients.filter((c) => c.region === region);
    const rev = rc.reduce((s, c) => s + progresses.get(c.id)!.spend, 0);
    return { region, agent, clients: rc.length, revenue: rev, avg: rc.length ? rev / rc.length : 0, pending: pending.filter((o) => o.agentId === agent.id).length };
  });
  const maxRegion = Math.max(1, ...regionRows.map((r) => r.revenue));

  const top = [...clients].sort((a, b) => progresses.get(b.id)!.spend - progresses.get(a.id)!.spend).slice(0, 5);
  const recent = [...orders].sort((a, b) => ((a.decidedAt ?? a.createdAt) < (b.decidedAt ?? b.createdAt) ? 1 : -1)).slice(0, 6);

  return (
    <div className="animate-swap">
      <PageHeader title={t.owner.title} subtitle={tr(t.owner.subtitle, { date: formatDate(today, lang, "long") })} />

      <KpiStrip
        className="mt-6"
        items={[
          { label: tr(t.owner.kpiRevenue90, { days: config.windowDays }), value: <Money amount={revenue90} /> },
          { label: t.owner.kpiRevenueAll, value: <Money amount={revenueAll} /> },
          { label: t.owner.kpiClients, value: active, tone: "loyalty", sub: tr(t.owner.kpiClientsSub, { n: withDiscount }) },
          { label: t.owner.kpiPending, value: pending.length, tone: pending.length ? "urgent" : "default", sub: tr(t.owner.kpiPendingSub, { n: agentsWithPending }) },
        ]}
      />

      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:gap-12">
        {/* Clients per tier */}
        <section>
          <SectionHeader title={t.owner.tiersHeading} body={t.owner.tiersBody} />
          <ul className="mt-4 space-y-3">
            {tierCounts.map(({ key, tier, n }) => (
              <li key={key} className="grid grid-cols-[112px_1fr_32px] items-center gap-3">
                <TierBadge tier={tier} size="sm" />
                <div className="h-6 overflow-hidden rounded-control bg-paper-2" aria-hidden="true">
                  <div className={cn("bar-progress h-full rounded-control", barColor(tier?.id ?? null))} style={{ width: `${(n / maxTier) * 100}%` }} />
                </div>
                <span className="text-right text-sm font-bold text-ink tnum">{n}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Region comparison */}
        <section>
          <SectionHeader
            title={t.owner.regionsHeading}
            body={tr(t.owner.regionsBody, { days: config.windowDays })}
            action={
              <Link href="/owner/agents" className="flex h-9 items-center gap-1 text-xs font-semibold text-forest hover:underline">
                {t.nav.owner.agents}
                <ArrowRightIcon className="size-4" aria-hidden="true" />
              </Link>
            }
          />
          <div className="mt-4 overflow-x-auto rounded-card border border-line bg-white shadow-rest">
            <table className="w-full min-w-[520px] text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs font-medium text-ink-3">
                  <th className="px-4 py-3 font-medium">{t.owner.colRegion}</th>
                  <th className="px-4 py-3 font-medium">{t.owner.colAgent}</th>
                  <th className="px-4 py-3 text-right font-medium">{t.owner.colClients}</th>
                  <th className="px-4 py-3 text-right font-medium">{t.owner.colRevenue}</th>
                  <th className="px-4 py-3 text-right font-medium">{t.owner.colAvg}</th>
                  <th className="px-4 py-3 text-right font-medium">{t.owner.colPending}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {regionRows.map((r) => (
                  <tr key={r.region}>
                    <td className="px-4 py-3">
                      <RegionTag region={r.region} className="text-sm font-semibold text-ink" />
                      <div className="mt-1.5 h-1.5 w-full max-w-[120px] overflow-hidden rounded-full bg-paper-2" aria-hidden="true">
                        <div className="h-full rounded-full bg-forest-3" style={{ width: `${(r.revenue / maxRegion) * 100}%` }} />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-ink-2">{r.agent.name}</td>
                    <td className="px-4 py-3 text-right tnum">{r.clients}</td>
                    <td className="px-4 py-3 text-right font-semibold text-ink">
                      <Money amount={r.revenue} />
                    </td>
                    <td className="px-4 py-3 text-right text-ink-2">
                      <Money amount={r.avg} />
                    </td>
                    <td className={cn("px-4 py-3 text-right tnum", r.pending ? "font-semibold text-paprika" : "text-ink-4")}>{r.pending}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-12">
        <section>
          <SectionHeader
            title={t.owner.topClients}
            action={
              <Link href="/owner/clients" className="flex h-9 items-center gap-1 text-xs font-semibold text-forest hover:underline">
                {t.common.viewAll}
                <ArrowRightIcon className="size-4" aria-hidden="true" />
              </Link>
            }
          />
          <ol className="mt-3 divide-y divide-line">
            {top.map((c, i) => {
              const p = progresses.get(c.id)!;
              return (
                <li key={c.id}>
                  <Link href={`/owner/clients/${c.id}`} className="flex items-center gap-3 py-3 hover:bg-paper">
                    <span className="w-5 text-xs font-semibold text-ink-4 tnum">{i + 1}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-ink">{c.name}</span>
                      <RegionTag region={c.region} withCity={c.city} className="mt-0.5" />
                    </span>
                    <TierBadge tier={p.tier} size="sm" />
                    <Money amount={p.spend} className="w-24 text-right text-sm font-bold text-ink" />
                  </Link>
                </li>
              );
            })}
          </ol>
        </section>

        <section>
          <SectionHeader title={t.owner.recentActivity} />
          {recent.length === 0 ? (
            <EmptyState icon={CheckCheckIcon} title={t.owner.activityEmpty} body={t.owner.activityEmptyBody} className="mt-3 rounded-card border border-dashed border-line-strong" />
          ) : (
            <ul className="mt-3 divide-y divide-line">
              {recent.map((o) => {
                const c = getClient(o.clientId)!;
                const a = getAgent(o.agentId)!;
                return (
                  <li key={o.id} className="flex items-center gap-3 py-3">
                    <RegionDot region={c.region} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-ink">{c.name}</span>
                      <span className="block text-xs text-ink-3 tnum">
                        {formatDate(o.decidedAt ?? o.createdAt, lang)} · {a.name} · {o.source === "agent" ? t.source.agent : t.source.client}
                      </span>
                    </span>
                    <StatusPill status={o.status} />
                    <Money amount={o.total} className="w-24 text-right text-sm font-bold text-ink" />
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

function OverviewSkeleton() {
  return (
    <LoadingRegion>
      <Skeleton className="h-7 w-48" />
      <Skeleton className="mt-3 h-4 w-72" />
      <div className="mt-6">
        <KpiStripSkeleton count={4} />
      </div>
      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:gap-12">
        <div>
          <Skeleton className="h-5 w-40" />
          <div className="mt-4 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="grid grid-cols-[112px_1fr_32px] items-center gap-3">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-4 w-6" />
              </div>
            ))}
          </div>
        </div>
        <div>
          <Skeleton className="h-5 w-48" />
          <Skeleton className="mt-4 h-[180px] rounded-card" />
        </div>
      </div>
    </LoadingRegion>
  );
}
