"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { LoadingRegion } from "@/components/shared/loading-region";
import { PageHeader, SectionHeader } from "@/components/shared/page-header";
import { RegionTag } from "@/components/shared/region-dot";
import { LangSwitch } from "@/components/shared/lang-switch";
import { DemoTools } from "@/components/shared/demo-tools";
import { Money } from "@/components/shared/money";
import { useI18n } from "@/lib/i18n";
import { useStore } from "@/lib/store";

export default function AgentAccountPage() {
  const { t, tr } = useI18n();
  const { loadState, data, session, getAgent, agentClients, progressFor } = useStore();
  if (loadState !== "ready" || !data || !session?.agentId) return <Sk />;
  const agent = getAgent(session.agentId)!;
  const clients = agentClients(agent.id);
  const revenue = clients.reduce((s, c) => s + progressFor(c.id).spend, 0);
  return (
    <div className="animate-swap max-w-2xl">
      <PageHeader title={t.agent.accountTitle} subtitle={tr(t.account.loggedInAs, { role: t.roles.agent })} />
      <dl className="mt-6 divide-y divide-line rounded-card border border-line bg-white px-4 shadow-rest">
        <Row label={t.common.agent} value={agent.name} />
        <Row label={t.common.region} value={<RegionTag region={agent.region} className="text-sm" />} />
        <Row label={t.agent.portfolio} value={`${clients.length} ${t.common.clients}`} />
        <Row label={tr(t.agent.kpiRevenue, { days: data.config.windowDays })} value={<Money amount={revenue} />} />
      </dl>
      <section className="mt-8">
        <SectionHeader title={t.common.language} />
        <div className="mt-3">
          <LangSwitch />
        </div>
      </section>
      <DemoTools />
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <dt className="text-xs font-medium text-ink-3">{label}</dt>
      <dd className="text-right text-sm font-semibold text-ink">{value}</dd>
    </div>
  );
}

function Sk() {
  return (
    <LoadingRegion className="max-w-2xl">
      <Skeleton className="h-7 w-40" />
      <Skeleton className="mt-3 h-4 w-40" />
      <div className="mt-6 divide-y divide-line rounded-card border border-line bg-white px-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex justify-between py-3">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-4 w-40" />
          </div>
        ))}
      </div>
    </LoadingRegion>
  );
}
