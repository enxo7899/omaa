"use client";

import { MessageCircleIcon, PhoneIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { LoadingRegion } from "@/components/shared/loading-region";
import { PageHeader, SectionHeader } from "@/components/shared/page-header";
import { RegionTag } from "@/components/shared/region-dot";
import { LangSwitch } from "@/components/shared/lang-switch";
import { useI18n } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import { initials } from "@/lib/utils-text";
import { DemoTools } from "@/components/shared/demo-tools";

export default function ClientAccountPage() {
  const { t, tr } = useI18n();
  const { loadState, data, session, getClient, getAgent } = useStore();

  if (loadState !== "ready" || !data || !session?.clientId) return <AccountSkeleton />;
  const client = getClient(session.clientId)!;
  const agent = getAgent(client.agentId)!;

  return (
    <div className="animate-swap max-w-2xl">
      <PageHeader title={t.account.title} subtitle={tr(t.account.loggedInAs, { role: t.roles.client })} />

      <dl className="mt-6 divide-y divide-line rounded-card border border-line bg-white px-4 shadow-rest">
        <Row label={t.account.business} value={`${client.name} · ${t.kinds[client.kind]}`} />
        <Row label={t.account.contact} value={client.contactName} />
        <Row label={t.common.city} value={<RegionTag region={client.region} withCity={client.city} className="text-sm" />} />
      </dl>

      <section className="mt-8">
        <SectionHeader title={t.account.yourAgent} body={t.account.agentBody} />
        <div className="mt-3 rounded-card border border-line bg-white p-4 shadow-rest">
          <div className="flex items-center gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-forest-tint text-sm font-bold text-forest">{initials(agent.name)}</span>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-ink">{agent.name}</div>
              <RegionTag region={agent.region} className="mt-0.5" />
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Button asChild variant="outline">
              <a href={`tel:+${agent.phone}`}>
                <PhoneIcon aria-hidden="true" />
                {t.common.call}
              </a>
            </Button>
            <Button asChild variant="outline">
              <a href={`https://wa.me/${agent.phone}`} target="_blank" rel="noopener noreferrer">
                <MessageCircleIcon aria-hidden="true" />
                WhatsApp
              </a>
            </Button>
          </div>
        </div>
      </section>

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

function AccountSkeleton() {
  return (
    <LoadingRegion className="max-w-2xl">
      <Skeleton className="h-7 w-32" />
      <Skeleton className="mt-3 h-4 w-40" />
      <div className="mt-6 divide-y divide-line rounded-card border border-line bg-white px-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex justify-between py-3">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-4 w-40" />
          </div>
        ))}
      </div>
      <Skeleton className="mt-8 h-5 w-24" />
      <Skeleton className="mt-3 h-[124px] rounded-card" />
    </LoadingRegion>
  );
}
