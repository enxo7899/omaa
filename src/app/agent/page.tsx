"use client";

import * as React from "react";
import Link from "next/link";
import { PlusIcon, SearchIcon, SearchXIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { LoadingRegion } from "@/components/shared/loading-region";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Chips } from "@/components/shared/chips";
import { KpiStrip, KpiStripSkeleton } from "@/components/shared/kpi-strip";
import { Money } from "@/components/shared/money";
import { ClientTable, ClientTableSkeleton } from "@/components/agent/client-table";
import { useI18n } from "@/lib/i18n";
import { useStore } from "@/lib/store";

type Sort = "spend" | "closest" | "name";

export default function AgentHomePage() {
  const { t, tr } = useI18n();
  const { loadState, data, session, getAgent, agentClients, agentOrders, progressFor } = useStore();
  const [q, setQ] = React.useState("");
  const [sort, setSort] = React.useState<Sort>("spend");

  if (loadState !== "ready" || !data || !session?.agentId) return <AgentHomeSkeleton />;
  const agent = getAgent(session.agentId)!;
  const clients = agentClients(agent.id);
  const orders = agentOrders(agent.id);
  const pending = orders.filter((o) => o.status === "pending").length;
  const progresses = new Map(clients.map((c) => [c.id, progressFor(c.id)]));
  const revenue = clients.reduce((s, c) => s + (progresses.get(c.id)?.spend ?? 0), 0);
  const withDiscount = clients.filter((c) => progresses.get(c.id)?.tier).length;

  const filtered = clients
    .filter((c) => !q || c.name.toLowerCase().includes(q.toLowerCase()) || c.city.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => {
      const pa = progresses.get(a.id)!;
      const pb = progresses.get(b.id)!;
      if (sort === "name") return a.name.localeCompare(b.name);
      if (sort === "closest") {
        const ra = pa.nextTier ? pa.remaining : Number.POSITIVE_INFINITY;
        const rb = pb.nextTier ? pb.remaining : Number.POSITIVE_INFINITY;
        return ra - rb;
      }
      return pb.spend - pa.spend;
    });

  return (
    <div className="animate-swap">
      <PageHeader
        title={t.agent.title}
        subtitle={tr(t.agent.subtitle, { region: t.regions[agent.region], n: clients.length })}
        action={
          <Button asChild>
            <Link href="/agent/log-sale">
              <PlusIcon aria-hidden="true" />
              {t.agent.logTitle}
            </Link>
          </Button>
        }
      />

      <KpiStrip
        className="mt-6"
        items={[
          { label: t.agent.kpiPending, value: pending, tone: pending > 0 ? "urgent" : "default", sub: <Link href="/agent/inbox" className="font-semibold text-forest hover:underline">{t.agent.inboxTitle}</Link> },
          { label: tr(t.agent.kpiRevenue, { days: data.config.windowDays }), value: <Money amount={revenue} /> },
          { label: t.agent.kpiClients, value: withDiscount, tone: "loyalty", sub: tr(t.agent.kpiClientsSub, { n: clients.length }) },
        ]}
      />

      <div className="mt-8 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Chips
          label={t.agent.sortLabel}
          value={sort}
          onChange={setSort}
          options={[
            { value: "spend", label: t.agent.sortSpend },
            { value: "closest", label: t.agent.sortClosest },
            { value: "name", label: t.agent.sortName },
          ]}
        />
        <div className="relative lg:w-72">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-ink-4" aria-hidden="true" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t.agent.searchPlaceholder} aria-label={t.agent.searchPlaceholder} className="pl-10" />
        </div>
      </div>

      <div className="mt-4">
        {filtered.length === 0 ? (
          <EmptyState
            icon={SearchXIcon}
            title={tr(t.agent.emptyClientsTitle, { q })}
            body={t.agent.emptyClientsBody}
            action={
              <Button variant="outline" onClick={() => setQ("")}>
                {t.catalog.clearSearch}
              </Button>
            }
            className="rounded-card border border-dashed border-line-strong"
          />
        ) : (
          <ClientTable clients={filtered} basePath="/agent/clients" logSalePath="/agent/log-sale" />
        )}
      </div>
    </div>
  );
}

function AgentHomeSkeleton() {
  return (
    <LoadingRegion>
      <div className="flex justify-between">
        <div>
          <Skeleton className="h-7 w-44" />
          <Skeleton className="mt-3 h-4 w-32" />
        </div>
        <Skeleton className="h-11 w-32" />
      </div>
      <div className="mt-6"><KpiStripSkeleton count={3} /></div>
      <div className="mt-8 flex flex-col gap-3 lg:flex-row lg:justify-between">
        <div className="flex gap-2">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-28" />
        </div>
        <Skeleton className="h-11 w-full lg:w-72" />
      </div>
      <div className="mt-4">
        <ClientTableSkeleton />
      </div>
    </LoadingRegion>
  );
}
