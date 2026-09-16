"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRightIcon, ClockIcon, RotateCcwIcon, ShoppingBasketIcon, SproutIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { LoadingRegion } from "@/components/shared/loading-region";
import { EmptyState } from "@/components/shared/empty-state";
import { TierBadge } from "@/components/shared/tier-badge";
import { Money } from "@/components/shared/money";
import { SectionHeader } from "@/components/shared/page-header";
import { ProgressRing } from "@/components/loyalty/progress-ring";
import { PurchaseRows } from "@/components/client/expiring-list";
import { useI18n } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import { formatDate, formatLek } from "@/lib/format";
import { windowStart } from "@/lib/loyalty";
import { toast } from "sonner";
import { cn } from "cn";

export default function ClientHomePage() {
  const { t, tr, lang } = useI18n();
  const { session, loadState, data, getClient, getAgent, progressFor, ordersFor, today, replaceCart } = useStore();
  const router = useRouter();

  if (loadState !== "ready" || !data || !session?.clientId) return <HomeSkeleton />;

  const client = getClient(session.clientId)!;
  const agent = getAgent(client.agentId);
  const progress = progressFor(client.id);
  const orders = ordersFor(client.id);
  const confirmed = orders.filter((o) => o.status === "confirmed");
  const pending = orders.filter((o) => o.status === "pending");
  const config = data.config;
  const topTier = config.tiers[config.tiers.length - 1];
  const firstName = client.contactName.split(" ")[0];
  const lastConfirmed = confirmed[0];

  const reorderLast = () => {
    if (!lastConfirmed) return;
    replaceCart(lastConfirmed.lines.map((l) => ({ productId: l.productId, qty: l.qty })));
    toast.success(tr(t.orders.reorderToast, { n: lastConfirmed.lines.length }));
    router.push("/client/cart");
  };

  const nextExpiry = progress.expiring[0];

  return (
    <div className="animate-swap">
      <div>
        <h1 className="text-xl font-bold tracking-[-0.01em] text-ink lg:text-2xl">{tr(t.home.greeting, { name: firstName })}</h1>
        <p className="mt-1 text-sm text-ink-2">{t.home.greetingSub}</p>
      </div>

      {pending.length > 0 && agent && (
        <Link
          href="/client/orders"
          className="mt-6 flex items-center gap-3 rounded-card border border-line bg-white px-4 py-3 text-sm shadow-rest transition-colors hover:border-forest"
        >
          <ClockIcon className="size-5 shrink-0 text-ink-3" aria-hidden="true" />
          <span className="min-w-0 flex-1 text-ink-2">
            {pending.length === 1 ? tr(t.home.pendingBannerOne, { agent: agent.name }) : tr(t.home.pendingBanner, { n: pending.length, agent: agent.name })}
          </span>
          <span className="flex shrink-0 items-center gap-1 text-xs font-semibold text-forest">
            {t.home.seeOrders}
            <ArrowRightIcon className="size-4" aria-hidden="true" />
          </span>
        </Link>
      )}

      {/* Hero: the ring */}
      <section className="mt-8 flex flex-col items-center gap-6 lg:flex-row lg:items-center lg:gap-14">
        <ProgressRing spend={progress.spend} config={config} size={248}>
          <span className="text-xs font-medium text-ink-3">{tr(t.home.spendLabel, { days: config.windowDays })}</span>
          <span className="mt-1 text-2xl font-extrabold tracking-[-0.02em] text-ink tnum">{formatLek(progress.spend, lang)}</span>
          <span className="mt-1 text-xs text-ink-3 tnum">{tr(t.home.ofTarget, { target: formatLek(topTier.min, lang) })}</span>
        </ProgressRing>

        <div className="w-full max-w-md text-center lg:text-left">
          <div className="text-xs font-medium text-ink-3">{t.home.yourTier}</div>
          <div className="mt-2 flex justify-center lg:justify-start">
            <TierBadge tier={progress.tier} size="lg" />
          </div>
          <p className="mt-3 text-base font-semibold text-ink">
            {progress.tier
              ? tr(t.home.currentDiscount, { pct: progress.tier.discountPercent })
              : tr(t.home.noDiscountYet, { amount: formatLek(config.tiers[0].min, lang) })}
          </p>

          <div className="mt-5 rounded-card border border-wheat/50 bg-wheat-tint/60 p-4 text-left">
            <div className="text-xs font-semibold text-wheat-3">{t.home.nextHeading}</div>
            {progress.nextTier ? (
              <>
                <p className="mt-1 text-sm font-semibold text-ink">
                  {tr(t.home.needMore, { amount: formatLek(progress.remaining, lang), tier: t.tiers[progress.nextTier.id], pct: progress.nextTier.discountPercent })}
                </p>
                {nextExpiry && (
                  <p className="mt-1 text-xs text-ink-2">
                    {tr(t.home.needMoreBy, {
                      date: formatDate(nextExpiry.expiresOn, lang),
                      purchaseDate: formatDate(nextExpiry.order.decidedAt ?? nextExpiry.order.createdAt, lang),
                      amount: formatLek(nextExpiry.order.total, lang),
                    })}
                  </p>
                )}
              </>
            ) : (
              <p className="mt-1 text-sm font-semibold text-ink">{tr(t.home.topTier, { amount: formatLek(topTier.min, lang), days: config.windowDays })}</p>
            )}
            {progress.dropAfterNextExpiry && (
              <p className="mt-2 border-t border-wheat/40 pt-2 text-xs text-ink-2">
                {progress.dropAfterNextExpiry.toTier
                  ? tr(t.home.dropWarning, {
                      date: formatDate(progress.dropAfterNextExpiry.on, lang),
                      purchaseDate: formatDate(progress.expiring[0].order.decidedAt ?? progress.expiring[0].order.createdAt, lang),
                      amount: formatLek(progress.dropAfterNextExpiry.amount, lang),
                      tier: t.tiers[progress.dropAfterNextExpiry.toTier.id],
                    })
                  : tr(t.home.dropWarningNone, {
                      date: formatDate(progress.dropAfterNextExpiry.on, lang),
                      purchaseDate: formatDate(progress.expiring[0].order.decidedAt ?? progress.expiring[0].order.createdAt, lang),
                      amount: formatLek(progress.dropAfterNextExpiry.amount, lang),
                    })}
              </p>
            )}
          </div>

          <div className="mt-5 flex flex-col gap-2 sm:flex-row lg:justify-start">
            <Button asChild className="sm:flex-1">
              <Link href="/client/catalog">
                <ShoppingBasketIcon aria-hidden="true" />
                {t.home.orderNow}
              </Link>
            </Button>
            {lastConfirmed && (
              <Button variant="outline" onClick={reorderLast} className="sm:flex-1">
                <RotateCcwIcon aria-hidden="true" />
                {t.home.reorderLast}
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Thresholds: honest math */}
      <section className="mt-10">
        <SectionHeader title={t.home.thresholds} body={tr(t.common.windowNote, { days: config.windowDays, from: formatDate(windowStart(today, config), lang), to: formatDate(today, lang) })} />
        <ol className="mt-4 grid grid-cols-3 gap-2 lg:gap-3">
          {config.tiers.map((tier) => {
            const reached = progress.spend >= tier.min;
            const current = progress.tier?.id === tier.id;
            return (
              <li
                key={tier.id}
                className={cn(
                  "rounded-card border p-3 lg:p-4",
                  current ? "border-wheat bg-wheat-tint/50" : reached ? "border-line bg-white" : "border-dashed border-line-strong bg-transparent",
                )}
              >
                <TierBadge tier={tier} size="sm" />
                <div className={cn("mt-2 text-sm font-bold tnum", reached ? "text-ink" : "text-ink-3")}>
                  <Money amount={tier.min} />
                </div>
                <div className="text-xs text-ink-3">{tr(t.tiers.discountOf, { pct: tier.discountPercent })}</div>
              </li>
            );
          })}
        </ol>
      </section>

      {/* Recent purchases */}
      <section className="mt-10">
        <SectionHeader
          title={t.home.recentHeading}
          action={
            confirmed.length > 0 ? (
              <Link href="/client/orders" className="flex h-9 items-center gap-1 text-xs font-semibold text-forest hover:underline">
                {t.common.viewAll}
                <ArrowRightIcon className="size-4" aria-hidden="true" />
              </Link>
            ) : undefined
          }
        />
        {confirmed.length === 0 ? (
          <EmptyState
            icon={SproutIcon}
            tone="loyalty"
            title={t.home.emptyTitle}
            body={t.home.emptyBody}
            action={
              <Button asChild>
                <Link href="/client/catalog">{t.home.emptyCta}</Link>
              </Button>
            }
            className="mt-2 rounded-card border border-dashed border-line-strong"
          />
        ) : (
          <PurchaseRows orders={confirmed.slice(0, 5)} className="mt-2" />
        )}
      </section>

      <section className="mt-10 max-w-[64ch] border-t border-line pt-6">
        <h2 className="text-sm font-semibold text-ink">{t.home.howItWorks}</h2>
        <p className="mt-1 text-xs leading-5 text-ink-3">{tr(t.home.howItWorksBody, { days: config.windowDays })}</p>
      </section>
    </div>
  );
}

function HomeSkeleton() {
  return (
    <LoadingRegion>
      <Skeleton className="h-7 w-52" />
      <Skeleton className="mt-3 h-4 w-72" />
      <div className="mt-8 flex flex-col items-center gap-6 lg:flex-row lg:gap-14">
        <Skeleton className="size-[248px] shrink-0 rounded-full" />
        <div className="w-full max-w-md">
          <Skeleton className="mx-auto h-3 w-16 lg:mx-0" />
          <Skeleton className="mx-auto mt-2 h-10 w-28 lg:mx-0" />
          <Skeleton className="mx-auto mt-3 h-5 w-64 lg:mx-0" />
          <Skeleton className="mt-5 h-[104px] w-full rounded-card" />
          <div className="mt-5 flex flex-col gap-2 sm:flex-row">
            <Skeleton className="h-11 flex-1" />
            <Skeleton className="h-11 flex-1" />
          </div>
        </div>
      </div>
      <Skeleton className="mt-10 h-5 w-24" />
      <div className="mt-4 grid grid-cols-3 gap-2 lg:gap-3">
        <Skeleton className="h-[92px] rounded-card" />
        <Skeleton className="h-[92px] rounded-card" />
        <Skeleton className="h-[92px] rounded-card" />
      </div>
      <Skeleton className="mt-10 h-5 w-32" />
      <div className="mt-2 divide-y divide-line">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between py-3">
            <div>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="mt-2 h-3 w-48" />
              <Skeleton className="mt-2 h-3 w-40" />
            </div>
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>
    </LoadingRegion>
  );
}
