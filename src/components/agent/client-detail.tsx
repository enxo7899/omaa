"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeftIcon, MessageCircleIcon, PhoneIcon, PlusIcon, SproutIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoadingRegion } from "@/components/shared/loading-region";
import { EmptyState } from "@/components/shared/empty-state";
import { TierBadge } from "@/components/shared/tier-badge";
import { RegionTag } from "@/components/shared/region-dot";
import { Money } from "@/components/shared/money";
import { SectionHeader } from "@/components/shared/page-header";
import { ProgressRing } from "@/components/loyalty/progress-ring";
import { PurchaseRows } from "@/components/client/expiring-list";
import { OrderCard, OrderCardSkeleton } from "@/components/orders/order-card";
import { useI18n } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import { formatDate, formatLek } from "@/lib/format";
import { cn } from "cn";

/** Client detail used by both Agent and Owner. */
export function ClientDetail({ clientId, backHref, logSaleHref }: { clientId: string; backHref: string; logSaleHref: string }) {
  const { t, tr, lang } = useI18n();
  const { loadState, data, getClient, getAgent, progressFor, ordersFor } = useStore();

  if (loadState !== "ready" || !data) return <ClientDetailSkeleton />;
  const client = getClient(clientId);
  if (!client) {
    return (
      <EmptyState
        icon={SproutIcon}
        title={t.common.notFoundTitle}
        body={t.common.notFoundBody}
        action={
          <Button asChild variant="outline">
            <Link href={backHref}>{t.common.back}</Link>
          </Button>
        }
      />
    );
  }
  const agent = getAgent(client.agentId);
  const p = progressFor(client.id);
  const orders = ordersFor(client.id);
  const confirmed = orders.filter((o) => o.status === "confirmed");
  const config = data.config;
  const topTier = config.tiers[config.tiers.length - 1];
  const nextExpiry = p.expiring[0];

  return (
    <div className="animate-swap">
      <Link href={backHref} className="inline-flex h-9 items-center gap-1.5 rounded-control text-xs font-semibold text-ink-3 hover:text-ink">
        <ArrowLeftIcon className="size-4" aria-hidden="true" />
        {t.common.back}
      </Link>

      <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-xl font-bold tracking-[-0.01em] text-ink lg:text-2xl">{client.name}</h1>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-3">
            <RegionTag region={client.region} withCity={client.city} />
            <span>{t.kinds[client.kind]}</span>
            {agent && <span>{tr(t.login.served, { name: agent.name })}</span>}
          </div>
        </div>
        <Button asChild>
          <Link href={`${logSaleHref}?client=${client.id}`}>
            <PlusIcon aria-hidden="true" />
            {t.agent.logSaleFor}
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="progress" className="mt-6">
        <TabsList className="h-11 w-full bg-paper-2 p-1 sm:w-auto">
          <TabsTrigger value="progress" className="h-9 flex-1 px-4 text-sm font-semibold data-[state=active]:bg-white data-[state=active]:text-ink sm:flex-none">
            {t.agent.tabProgress}
          </TabsTrigger>
          <TabsTrigger value="history" className="h-9 flex-1 px-4 text-sm font-semibold data-[state=active]:bg-white data-[state=active]:text-ink sm:flex-none">
            {t.agent.tabHistory} <span className="ml-1 text-xs text-ink-3 tnum">({orders.length})</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="progress" className="mt-6">
          <div className="grid gap-8 lg:grid-cols-[auto_1fr] lg:gap-14">
            <div className="flex justify-center">
              <ProgressRing spend={p.spend} config={config} size={200} stroke={14}>
                <span className="text-[11px] font-medium text-ink-3">{tr(t.agent.spendWindow, { days: config.windowDays })}</span>
                <span className="mt-1 text-xl font-extrabold tracking-[-0.02em] text-ink tnum">{formatLek(p.spend, lang)}</span>
                <span className="mt-0.5 text-[11px] text-ink-3 tnum">{tr(t.home.ofTarget, { target: formatLek(topTier.min, lang) })}</span>
              </ProgressRing>
            </div>
            <div className="max-w-xl">
              <TierBadge tier={p.tier} size="lg" showDiscount />
              <div className="mt-4 rounded-card border border-wheat/50 bg-wheat-tint/60 p-4">
                <div className="text-xs font-semibold text-wheat-3">{t.home.nextHeading}</div>
                {p.nextTier ? (
                  <p className="mt-1 text-sm font-semibold text-ink">
                    {tr(t.home.needMore, { amount: formatLek(p.remaining, lang), tier: t.tiers[p.nextTier.id], pct: p.nextTier.discountPercent })}
                  </p>
                ) : (
                  <p className="mt-1 text-sm font-semibold text-ink">{tr(t.home.topTier, { amount: formatLek(topTier.min, lang), days: config.windowDays })}</p>
                )}
                {nextExpiry && (
                  <p className="mt-1 text-xs text-ink-2">
                    {tr(t.agent.nextExpiry, { date: formatDate(nextExpiry.order.decidedAt ?? nextExpiry.order.createdAt, lang), expiry: formatDate(nextExpiry.expiresOn, lang) })}
                  </p>
                )}
                {p.dropAfterNextExpiry && (
                  <p className="mt-2 border-t border-wheat/40 pt-2 text-xs text-paprika-2">
                    {p.dropAfterNextExpiry.toTier
                      ? tr(t.home.dropWarning, {
                          date: formatDate(p.dropAfterNextExpiry.on, lang),
                          purchaseDate: formatDate(p.expiring[0].order.decidedAt ?? p.expiring[0].order.createdAt, lang),
                          amount: formatLek(p.dropAfterNextExpiry.amount, lang),
                          tier: t.tiers[p.dropAfterNextExpiry.toTier.id],
                        })
                      : tr(t.home.dropWarningNone, {
                          date: formatDate(p.dropAfterNextExpiry.on, lang),
                          purchaseDate: formatDate(p.expiring[0].order.decidedAt ?? p.expiring[0].order.createdAt, lang),
                          amount: formatLek(p.dropAfterNextExpiry.amount, lang),
                        })}
                  </p>
                )}
              </div>

              <ol className="mt-4 grid grid-cols-3 gap-2">
                {config.tiers.map((tier) => {
                  const reached = p.spend >= tier.min;
                  const current = p.tier?.id === tier.id;
                  return (
                    <li key={tier.id} className={cn("rounded-card border p-3", current ? "border-wheat bg-wheat-tint/50" : reached ? "border-line bg-white" : "border-dashed border-line-strong")}>
                      <TierBadge tier={tier} size="sm" />
                      <div className={cn("mt-2 text-sm font-bold tnum", reached ? "text-ink" : "text-ink-3")}>
                        <Money amount={tier.min} />
                      </div>
                      <div className="text-xs text-ink-3">{tr(t.tiers.discountOf, { pct: tier.discountPercent })}</div>
                    </li>
                  );
                })}
              </ol>

              <div className="mt-6">
                <SectionHeader title={t.agent.contactHeading} />
                <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-ink-2">
                  <span className="font-semibold text-ink">{client.contactName}</span>
                  <Button asChild size="sm" variant="outline">
                    <a href={`tel:+${client.phone}`}>
                      <PhoneIcon aria-hidden="true" />
                      {t.common.call}
                    </a>
                  </Button>
                  <Button asChild size="sm" variant="outline">
                    <a href={`https://wa.me/${client.phone}`} target="_blank" rel="noopener noreferrer">
                      <MessageCircleIcon aria-hidden="true" />
                      WhatsApp
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <section className="mt-10">
            <SectionHeader title={t.home.recentHeading} body={tr(t.agent.ordersCount, { n: orders.length })} />
            {confirmed.length === 0 ? (
              <EmptyState
                icon={SproutIcon}
                tone="loyalty"
                title={t.agent.historyEmptyTitle}
                body={tr(t.agent.historyEmptyBody, { client: client.name })}
                action={
                  <Button asChild>
                    <Link href={`${logSaleHref}?client=${client.id}`}>
                      <PlusIcon aria-hidden="true" />
                      {t.agent.logSaleFor}
                    </Link>
                  </Button>
                }
                className="mt-2 rounded-card border border-dashed border-line-strong"
              />
            ) : (
              <PurchaseRows orders={confirmed.slice(0, 6)} className="mt-2" />
            )}
          </section>
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          {orders.length === 0 ? (
            <EmptyState
              icon={SproutIcon}
              tone="loyalty"
              title={t.agent.historyEmptyTitle}
              body={tr(t.agent.historyEmptyBody, { client: client.name })}
              action={
                <Button asChild>
                  <Link href={`${logSaleHref}?client=${client.id}`}>
                    <PlusIcon aria-hidden="true" />
                    {t.agent.logSaleFor}
                  </Link>
                </Button>
              }
              className="rounded-card border border-dashed border-line-strong"
            />
          ) : (
            <ul className="grid gap-3 lg:grid-cols-2 lg:gap-4">
              {orders.map((o) => (
                <li key={o.id}>
                  <OrderCard order={o} viewer="agent" />
                </li>
              ))}
            </ul>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export function ClientDetailSkeleton() {
  return (
    <LoadingRegion>
      <Skeleton className="h-4 w-16" />
      <div className="mt-2 flex justify-between">
        <div>
          <Skeleton className="h-7 w-56" />
          <Skeleton className="mt-2 h-3 w-40" />
        </div>
        <Skeleton className="h-11 w-32" />
      </div>
      <Skeleton className="mt-6 h-11 w-full sm:w-64" />
      <div className="mt-6 grid gap-8 lg:grid-cols-[auto_1fr] lg:gap-14">
        <div className="flex justify-center">
          <Skeleton className="size-[200px] rounded-full" />
        </div>
        <div className="max-w-xl">
          <Skeleton className="h-10 w-40" />
          <Skeleton className="mt-4 h-[96px] rounded-card" />
          <div className="mt-4 grid grid-cols-3 gap-2">
            <Skeleton className="h-[92px] rounded-card" />
            <Skeleton className="h-[92px] rounded-card" />
            <Skeleton className="h-[92px] rounded-card" />
          </div>
        </div>
      </div>
      <div className="mt-10">
        <OrderCardSkeleton />
      </div>
    </LoadingRegion>
  );
}
