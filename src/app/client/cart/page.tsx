"use client";

import * as React from "react";
import Link from "next/link";
import { AwardIcon, CheckCircle2Icon, MessageCircleIcon, PhoneIcon, ShoppingBasketIcon, Trash2Icon, TrendingUpIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { LoadingRegion } from "@/components/shared/loading-region";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { ProductImage } from "@/components/shared/product-image";
import { QtyStepper } from "@/components/shared/qty-stepper";
import { Money } from "@/components/shared/money";
import { InlineError } from "@/components/shared/inline-error";
import { useI18n } from "@/lib/i18n";
import { useCartDetails, useStore } from "@/lib/store";
import { formatLek } from "@/lib/format";
import { projectTier } from "@/lib/loyalty";
import { cn } from "cn";

type Phase = "edit" | "sending" | "sent";

export default function CartPage() {
  const { t, tr, lang } = useI18n();
  const { loadState, data, session, getClient, getAgent, progressFor, setCartQty, removeFromCart, clearCart, submitOrder } = useStore();
  const { lines, subtotal, count } = useCartDetails();
  const [note, setNote] = React.useState("");
  const [phase, setPhase] = React.useState<Phase>("edit");
  const [failed, setFailed] = React.useState(false);

  if (loadState !== "ready" || !data || !session?.clientId) return <CartSkeleton />;

  const client = getClient(session.clientId)!;
  const agent = getAgent(client.agentId)!;
  const progress = progressFor(client.id);
  const discountPct = progress.discountPercent;
  const discount = Math.round(subtotal * (discountPct / 100));
  const total = subtotal - discount;
  const config = data.config;
  const projection = projectTier(progress.spend, total, config);

  const submit = async () => {
    setPhase("sending");
    setFailed(false);
    try {
      await submitOrder({
        lines: lines.map((l) => ({ productId: l.productId, qty: l.qty, unitPrice: l.product.price })),
        discountPercent: discountPct,
        note,
      });
      clearCart();
      setPhase("sent");
    } catch {
      setFailed(true);
      setPhase("edit");
    }
  };

  const waText = tr(t.cart.whatsappMessage, {
    agent: agent.name.split(" ")[0],
    client: client.name,
    lines: lines.map((l) => `• ${l.product.name} × ${l.qty} ${l.product.unit[lang]}`).join("\n"),
    total: formatLek(total, lang),
  });
  const waHref = `https://wa.me/${agent.phone}?text=${encodeURIComponent(waText)}`;

  if (phase === "sent") {
    return (
      <div className="animate-swap">
        <EmptyState
          icon={CheckCircle2Icon}
          tone="positive"
          title={t.cart.successTitle}
          body={tr(t.cart.successBody, { agent: agent.name })}
          action={
            <>
              <Button asChild>
                <Link href="/client/orders">{t.cart.successCta}</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/client">{t.cart.successSecondary}</Link>
              </Button>
            </>
          }
          className="mx-auto max-w-md pt-20"
        />
      </div>
    );
  }

  if (count === 0) {
    return (
      <div className="animate-swap">
        <PageHeader title={t.cart.title} />
        <EmptyState
          icon={ShoppingBasketIcon}
          title={t.cart.emptyTitle}
          body={t.cart.emptyBody}
          action={
            <>
              <Button asChild>
                <Link href="/client/catalog">{t.cart.emptyCatalog}</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/client/orders">{t.cart.emptyOrders}</Link>
              </Button>
            </>
          }
          className="mt-6 rounded-card border border-dashed border-line-strong"
        />
      </div>
    );
  }

  return (
    <div className="animate-swap pb-24 lg:pb-0">
      <PageHeader
        title={t.cart.title}
        subtitle={tr(t.cart.linesCount, { n: count })}
        action={
          <Button variant="ghost" size="sm" onClick={clearCart} className="text-ink-3">
            <Trash2Icon aria-hidden="true" />
            {t.cart.clear}
          </Button>
        }
      />

      <div className="mt-6 lg:grid lg:grid-cols-[1fr_360px] lg:items-start lg:gap-10">
        <ul className="divide-y divide-line rounded-card border border-line bg-white px-4 shadow-rest">
          {lines.map((l) => {
            const p = l.product;
            const yourPrice = Math.round(p.price * (1 - discountPct / 100));
            return (
              <li key={l.productId} className="flex gap-3 py-4">
                <ProductImage product={p} className="size-20" sizes="80px" priority />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-ink">{lang === "sq" ? p.name : p.nameEn}</div>
                      <div className="mt-0.5 text-xs text-ink-3">
                        <Money amount={yourPrice} /> · {p.unit[lang]}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFromCart(l.productId)}
                      className="flex h-9 shrink-0 items-center gap-1 rounded-control px-2 text-xs font-semibold text-ink-3 hover:bg-paper-2 hover:text-paprika"
                    >
                      <Trash2Icon className="size-4" aria-hidden="true" />
                      {t.cart.remove}
                    </button>
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <QtyStepper value={l.qty} onChange={(n) => setCartQty(l.productId, n)} label={p.name} />
                    <Money amount={yourPrice * l.qty} className="text-sm font-bold text-ink" />
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        <div className="mt-6 lg:mt-0">
          {/* Loyalty nudge */}
          <Nudge projection={projection} total={total} />

          <dl className="mt-4 space-y-2 rounded-card border border-line bg-white p-4 text-sm shadow-rest">
            <div className="flex justify-between text-ink-2">
              <dt>{t.cart.subtotal}</dt>
              <dd>
                <Money amount={subtotal} />
              </dd>
            </div>
            {discountPct > 0 && progress.tier && (
              <div className="flex justify-between text-wheat-3">
                <dt>{tr(t.cart.discountLine, { tier: t.tiers[progress.tier.id], pct: discountPct })}</dt>
                <dd>
                  <Money amount={-discount} signed />
                </dd>
              </div>
            )}
            <div className="flex justify-between border-t border-line pt-2 text-base font-bold text-ink">
              <dt>{t.cart.total}</dt>
              <dd>
                <Money amount={total} />
              </dd>
            </div>
          </dl>

          <div className="mt-4">
            <Label htmlFor="note" className="text-xs font-medium text-ink-2">
              {t.cart.noteLabel} <span className="text-ink-4">({t.common.optional})</span>
            </Label>
            <Input id="note" value={note} onChange={(e) => setNote(e.target.value)} placeholder={t.cart.notePlaceholder} className="mt-1.5" />
          </div>

          <p className="mt-3 text-xs text-ink-3">{tr(t.cart.pendingInfo, { agent: agent.name })}</p>

          {failed && (
            <div className="mt-4">
              <InlineError
                title={t.cart.errorTitle}
                body={t.cart.errorBody}
                actions={
                  <>
                    <Button size="sm" onClick={submit}>
                      {t.common.retry}
                    </Button>
                    <Button asChild size="sm" variant="outline">
                      <a href={`tel:+${agent.phone}`}>
                        <PhoneIcon aria-hidden="true" />
                        {tr(t.cart.errorCall, { name: agent.name.split(" ")[0] })}
                      </a>
                    </Button>
                  </>
                }
              />
            </div>
          )}

          {/* Desktop primary action lives here; mobile uses the sticky bar below */}
          <div className="mt-4 hidden lg:block">
            <Button size="lg" className="w-full" onClick={submit} disabled={phase === "sending"} aria-busy={phase === "sending"}>
              {phase === "sending" ? t.cart.sending : t.cart.submit}
            </Button>
          </div>

          <div className="mt-6 border-t border-line pt-4">
            <Button asChild variant="outline" className="w-full">
              <a href={waHref} target="_blank" rel="noopener noreferrer">
                <MessageCircleIcon aria-hidden="true" />
                {t.cart.whatsapp}
              </a>
            </Button>
            <p className="mt-2 text-center text-xs text-ink-3">{tr(t.cart.whatsappHint, { agent: agent.name.split(" ")[0] })}</p>
          </div>
        </div>
      </div>

      {/* Mobile sticky primary action, thumb zone */}
      <div className="fixed inset-x-0 bottom-[72px] z-30 border-t border-line bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
        <Button size="lg" className="w-full justify-between" onClick={submit} disabled={phase === "sending"} aria-busy={phase === "sending"}>
          <span>{phase === "sending" ? t.cart.sending : t.cart.submit}</span>
          <Money amount={total} />
        </Button>
      </div>
    </div>
  );
}

function Nudge({ projection, total }: { projection: ReturnType<typeof projectTier>; total: number }) {
  const { t, tr, lang } = useI18n();
  const { data, session, progressFor } = useStore();
  const progress = progressFor(session!.clientId!);
  const config = data!.config;
  let text: string;
  let strong = false;
  if (projection.unlocks) {
    text = tr(t.cart.nudgeWillUnlock, { tier: t.tiers[projection.unlocks.id], pct: projection.unlocks.discountPercent });
    strong = true;
  } else if (projection.next) {
    const gap = projection.next.min - (projection.before ? projection.before.min : 0);
    if (projection.remainingToNext <= gap * 0.5) {
      text = tr(t.cart.nudgeUnlock, { amount: formatLek(projection.remainingToNext, lang), tier: t.tiers[projection.next.id] });
      strong = true;
    } else {
      text = tr(t.cart.nudgeProgress, { amount: formatLek(progress.spend + total, lang), target: formatLek(projection.next.min, lang), tier: t.tiers[projection.next.id] });
    }
  } else {
    text = t.cart.nudgeTop;
  }
  const top = config.tiers[config.tiers.length - 1].min;
  const after = Math.min(1, (progress.spend + total) / top);
  const before = Math.min(1, progress.spend / top);
  return (
    <div className={cn("rounded-card border p-4", strong ? "border-wheat bg-wheat-tint/70" : "border-line bg-white")}>
      <div className="flex items-start gap-3">
        {strong ? <AwardIcon className="mt-0.5 size-5 shrink-0 text-wheat-3" aria-hidden="true" /> : <TrendingUpIcon className="mt-0.5 size-5 shrink-0 text-ink-3" aria-hidden="true" />}
        <p className={cn("text-sm", strong ? "font-semibold text-ink" : "text-ink-2")}>{text}</p>
      </div>
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-paper-3" aria-hidden="true">
        <div className="relative h-full">
          <div className="bar-progress absolute inset-y-0 left-0 rounded-full bg-wheat/45" style={{ width: `${after * 100}%` }} />
          <div className="bar-progress absolute inset-y-0 left-0 rounded-full bg-wheat" style={{ width: `${before * 100}%` }} />
        </div>
      </div>
    </div>
  );
}

function CartSkeleton() {
  return (
    <LoadingRegion>
      <Skeleton className="h-7 w-32" />
      <Skeleton className="mt-3 h-4 w-40" />
      <div className="mt-6 lg:grid lg:grid-cols-[1fr_360px] lg:gap-10">
        <div className="divide-y divide-line rounded-card border border-line bg-white px-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-3 py-4">
              <Skeleton className="size-20" />
              <div className="flex-1">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="mt-2 h-3 w-28" />
                <div className="mt-2 flex justify-between">
                  <Skeleton className="h-11 w-36" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 lg:mt-0">
          <Skeleton className="h-[92px] rounded-card" />
          <Skeleton className="mt-4 h-[120px] rounded-card" />
          <Skeleton className="mt-4 h-11" />
        </div>
      </div>
    </LoadingRegion>
  );
}
