"use client";

import Link from "next/link";
import { ChevronRightIcon, PlusIcon } from "lucide-react";
import type { Client } from "@/lib/types";
import { useI18n } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import { formatLek } from "@/lib/format";
import { TierBadge } from "@/components/shared/tier-badge";
import { RegionTag } from "@/components/shared/region-dot";
import { MiniBar } from "@/components/loyalty/mini-bar";
import { Money } from "@/components/shared/money";
import { Button } from "@/components/ui/button";
import { cn } from "cn";

/**
 * Client list: single-column rows on mobile, a dense table at ≥1024px.
 * `basePath` decides where a row links (agent vs owner).
 */
export function ClientTable({ clients, basePath, logSalePath, showAgent }: { clients: Client[]; basePath: string; logSalePath?: string; showAgent?: boolean }) {
  const { t, tr, lang } = useI18n();
  const { progressFor, ordersFor, getAgent, data } = useStore();
  const days = data!.config.windowDays;

  const rows = clients.map((c) => {
    const p = progressFor(c.id);
    const pending = ordersFor(c.id).filter((o) => o.status === "pending").length;
    const agent = getAgent(c.agentId);
    const remainingText = p.nextTier
      ? tr(t.agent.remainingTo, { amount: formatLek(p.remaining, lang), tier: t.tiers[p.nextTier.id] })
      : t.agent.atTop;
    return { c, p, pending, agent, remainingText };
  });

  return (
    <>
      {/* Mobile / tablet list */}
      <ul className="divide-y divide-line rounded-card border border-line bg-white shadow-rest lg:hidden">
        {rows.map(({ c, p, pending, remainingText }) => (
          <li key={c.id}>
            <Link href={`${basePath}/${c.id}`} className="flex items-center gap-3 p-4 transition-colors hover:bg-paper focus-visible:outline-offset-[-2px]">
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="truncate text-sm font-semibold text-ink">{c.name}</div>
                  <TierBadge tier={p.tier} size="sm" />
                </div>
                <div className="mt-0.5 flex items-center gap-2 text-xs text-ink-3">
                  <RegionTag region={c.region} withCity={c.city} />
                  {pending > 0 && <span className="rounded-control bg-paper-2 px-1.5 py-0.5 font-medium text-ink-2">{tr(t.agent.pendingCount, { n: pending })}</span>}
                </div>
                <MiniBar value={p.overallPercent} className="mt-3" />
                <div className="mt-1.5 flex items-center justify-between text-xs">
                  <span className="text-ink-2">{p.spend === 0 ? t.agent.noPurchases : remainingText}</span>
                  <Money amount={p.spend} className="font-semibold text-ink" />
                </div>
              </div>
              <ChevronRightIcon className="size-5 shrink-0 text-ink-4" aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ul>

      {/* Desktop table */}
      <div className="hidden overflow-x-auto rounded-card border border-line bg-white shadow-rest lg:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs font-medium text-ink-3">
              <th className="px-4 py-3 font-medium">{t.agent.clientTitle}</th>
              {showAgent && <th className="px-4 py-3 font-medium">{t.common.agent}</th>}
              <th className="px-4 py-3 font-medium">{t.common.tier}</th>
              <th className="px-4 py-3 text-right font-medium">{tr(t.owner.colSpend, { days })}</th>
              <th className="w-[26%] px-4 py-3 font-medium">{t.agent.tabProgress}</th>
              <th className="px-4 py-3 text-right font-medium">{t.owner.colPending}</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map(({ c, p, pending, agent, remainingText }) => (
              <tr key={c.id} className="group transition-colors hover:bg-paper">
                <td className="px-4 py-3">
                  <Link href={`${basePath}/${c.id}`} className="font-semibold text-ink hover:underline">
                    {c.name}
                  </Link>
                  <div className="mt-0.5">
                    <RegionTag region={c.region} withCity={c.city} />
                  </div>
                </td>
                {showAgent && <td className="px-4 py-3 text-ink-2">{agent?.name}</td>}
                <td className="px-4 py-3">
                  <TierBadge tier={p.tier} size="sm" />
                </td>
                <td className="px-4 py-3 text-right font-semibold text-ink">
                  <Money amount={p.spend} />
                </td>
                <td className="px-4 py-3">
                  <MiniBar value={p.overallPercent} />
                  <div className="mt-1 text-xs text-ink-3">{p.spend === 0 ? t.agent.noPurchases : remainingText}</div>
                </td>
                <td className={cn("px-4 py-3 text-right tnum", pending > 0 ? "font-semibold text-ink" : "text-ink-4")}>{pending}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    {logSalePath && (
                      <Button asChild size="sm" variant="secondary">
                        <Link href={`${logSalePath}?client=${c.id}`}>
                          <PlusIcon aria-hidden="true" />
                          {t.agent.logSaleFor}
                        </Link>
                      </Button>
                    )}
                    <Button asChild size="sm" variant="outline">
                      <Link href={`${basePath}/${c.id}`}>{t.agent.viewClient}</Link>
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export function ClientTableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <>
      <div className="divide-y divide-line rounded-card border border-line bg-white lg:hidden">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="p-4">
            <div className="flex justify-between">
              <div className="skeleton h-4 w-40" />
              <div className="skeleton h-6 w-16" />
            </div>
            <div className="skeleton mt-2 h-3 w-28" />
            <div className="skeleton mt-3 h-2 w-full rounded-full" />
            <div className="mt-2 flex justify-between">
              <div className="skeleton h-3 w-32" />
              <div className="skeleton h-3 w-16" />
            </div>
          </div>
        ))}
      </div>
      <div className="hidden rounded-card border border-line bg-white lg:block">
        <div className="border-b border-line px-4 py-3">
          <div className="skeleton h-3 w-full" />
        </div>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-6 border-b border-line px-4 py-4 last:border-b-0">
            <div className="w-[22%]">
              <div className="skeleton h-4 w-40" />
              <div className="skeleton mt-2 h-3 w-24" />
            </div>
            <div className="skeleton h-6 w-20" />
            <div className="skeleton ml-auto h-4 w-24" />
            <div className="w-[26%]">
              <div className="skeleton h-2 w-full rounded-full" />
              <div className="skeleton mt-2 h-3 w-32" />
            </div>
            <div className="skeleton h-4 w-6" />
            <div className="skeleton h-9 w-40" />
          </div>
        ))}
      </div>
    </>
  );
}
