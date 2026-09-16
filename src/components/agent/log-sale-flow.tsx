"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowRightIcon, AwardIcon, CheckCircle2Icon, CheckIcon, PackageOpenIcon, SearchIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { LoadingRegion } from "@/components/shared/loading-region";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { TierBadge } from "@/components/shared/tier-badge";
import { RegionTag } from "@/components/shared/region-dot";
import { Money } from "@/components/shared/money";
import { InlineError } from "@/components/shared/inline-error";
import { Chips } from "@/components/shared/chips";
import { ProductCard } from "@/components/catalog/product-card";
import { MiniBar } from "@/components/loyalty/mini-bar";
import { useI18n } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import { formatLek } from "@/lib/format";
import { projectTier } from "@/lib/loyalty";
import type { Client, ProductCategory } from "@/lib/types";
import { cn } from "cn";

type Step = 1 | 2 | 3;
type Cat = ProductCategory | "all";

/** Agent/Owner: log an off-app sale in three quick steps. */
export function LogSaleFlow({ clients, clientHref }: { clients: Client[]; clientHref: string }) {
  const { t, tr, lang } = useI18n();
  const { loadState, data, progressFor, logSale } = useStore();
  const params = useSearchParams();
  const preselect = params.get("client");

  const [clientId, setClientId] = React.useState<string | null>(preselect);
  const [step, setStep] = React.useState<Step>(preselect ? 2 : 1);
  const [q, setQ] = React.useState("");
  const [cat, setCat] = React.useState<Cat>("all");
  const [lines, setLines] = React.useState<Record<string, number>>({});
  const [busy, setBusy] = React.useState(false);
  const [failed, setFailed] = React.useState(false);
  const [done, setDone] = React.useState<{ spend: number; unlocked: { id: "bronz" | "argjend" | "ar"; pct: number } | null } | null>(null);

  if (loadState !== "ready" || !data) return <LogSaleSkeleton />;

  const client = clientId ? clients.find((c) => c.id === clientId) ?? null : null;
  const products = data.products;
  const config = data.config;
  const picked = products.filter((p) => (lines[p.id] ?? 0) > 0);
  const total = picked.reduce((s, p) => s + p.price * (lines[p.id] ?? 0), 0);
  const progress = client ? progressFor(client.id) : null;
  const projection = progress ? projectTier(progress.spend, total, config) : null;

  const submit = async () => {
    if (!client) return;
    setBusy(true);
    setFailed(false);
    try {
      const { change } = await logSale(
        client.id,
        picked.map((p) => ({ productId: p.id, qty: lines[p.id], unitPrice: p.price })),
      );
      const spend = progressFor(client.id).spend + total; // optimistic: store updates on next render
      const unlocked = change.to && change.to.id !== change.from?.id ? { id: change.to.id, pct: change.to.discountPercent } : null;
      setDone({ spend, unlocked });
      if (unlocked) toast.success(tr(t.agent.saleUnlocked, { client: client.name, tier: t.tiers[unlocked.id], pct: unlocked.pct }));
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  };

  /* ---------- success ---------- */
  if (done && client) {
    return (
      <div className="animate-swap mx-auto max-w-md pt-10">
        <EmptyState
          icon={done.unlocked ? AwardIcon : CheckCircle2Icon}
          tone={done.unlocked ? "loyalty" : "positive"}
          title={t.agent.saleSaved}
          body={
            done.unlocked
              ? tr(t.agent.saleUnlocked, { client: client.name, tier: t.tiers[done.unlocked.id], pct: done.unlocked.pct })
              : tr(t.agent.saleSavedBody, { client: client.name, spend: formatLek(done.spend, lang), days: config.windowDays })
          }
          action={
            <>
              <Button
                onClick={() => {
                  setLines({});
                  setDone(null);
                  setStep(1);
                  setClientId(null);
                }}
              >
                {t.agent.anotherSale}
              </Button>
              <Button asChild variant="outline">
                <Link href={`${clientHref}/${client.id}`}>{t.agent.viewClient}</Link>
              </Button>
            </>
          }
        />
      </div>
    );
  }

  const stepLabel = (n: Step, label: string) => (
    <li className={cn("flex items-center gap-2 text-xs font-semibold", step === n ? "text-forest" : step > n ? "text-ink-2" : "text-ink-4")}>
      <span className={cn("flex size-6 items-center justify-center rounded-full border text-[11px] tnum", step === n ? "border-forest bg-forest text-white" : step > n ? "border-forest bg-forest-tint text-forest" : "border-line-strong")}>
        {step > n ? <CheckIcon className="size-3.5" aria-hidden="true" /> : n}
      </span>
      {label}
    </li>
  );

  return (
    <div className="animate-swap pb-24 lg:pb-0">
      <PageHeader title={t.agent.logTitle} subtitle={t.agent.logSubtitle} />
      <ol className="mt-5 flex items-center gap-4 sm:gap-6">
        {stepLabel(1, t.agent.stepClient)}
        <span className="h-px w-4 bg-line-strong sm:w-8" aria-hidden="true" />
        {stepLabel(2, t.agent.stepProducts)}
        <span className="h-px w-4 bg-line-strong sm:w-8" aria-hidden="true" />
        {stepLabel(3, t.agent.stepConfirm)}
      </ol>

      {/* Step 1: client */}
      {step === 1 && (
        <section className="mt-6">
          <h2 className="text-base font-bold text-ink">{t.agent.pickClient}</h2>
          <div className="relative mt-3 lg:max-w-sm">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-ink-4" aria-hidden="true" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t.agent.searchPlaceholder} aria-label={t.agent.searchPlaceholder} className="pl-10" />
          </div>
          <ul className="mt-4 divide-y divide-line rounded-card border border-line bg-white shadow-rest">
            {clients
              .filter((c) => !q || c.name.toLowerCase().includes(q.toLowerCase()) || c.city.toLowerCase().includes(q.toLowerCase()))
              .map((c) => {
                const p = progressFor(c.id);
                return (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setClientId(c.id);
                        setStep(2);
                      }}
                      className="flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-paper focus-visible:outline-offset-[-2px]"
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold text-ink">{c.name}</span>
                        <RegionTag region={c.region} withCity={c.city} className="mt-0.5" />
                      </span>
                      <TierBadge tier={p.tier} size="sm" />
                    </button>
                  </li>
                );
              })}
          </ul>
        </section>
      )}

      {/* Step 2: products */}
      {step === 2 && client && (
        <section className="mt-6">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-line bg-white px-4 py-3 shadow-rest">
            <div className="min-w-0">
              <div className="text-xs text-ink-3">{t.agent.stepClient}</div>
              <div className="text-sm font-semibold text-ink">{client.name}</div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setStep(1)}>
              {t.agent.changeClient}
            </Button>
          </div>
          <h2 className="mt-6 text-base font-bold text-ink">{t.agent.pickProducts}</h2>
          <Chips
            className="mt-3"
            label={t.categories.all}
            value={cat}
            onChange={setCat}
            options={[
              { value: "all", label: t.categories.all },
              { value: "oriz", label: t.categories.oriz },
              { value: "miell", label: t.categories.miell },
              { value: "turshi", label: t.categories.turshi },
            ]}
          />
          <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 lg:gap-4">
            {products
              .filter((p) => cat === "all" || p.category === cat)
              .map((p, i) => (
                <ProductCard key={p.id} product={p} qty={lines[p.id] ?? 0} onQty={(n) => setLines((prev) => ({ ...prev, [p.id]: n }))} compact priority={i < 8} />
              ))}
          </div>
        </section>
      )}

      {/* Step 3: confirm */}
      {step === 3 && client && progress && projection && (
        <section className="mt-6 lg:grid lg:grid-cols-[1fr_360px] lg:items-start lg:gap-10">
          <div>
            <div className="rounded-card border border-line bg-white px-4 shadow-rest">
              <div className="flex items-center justify-between gap-3 border-b border-line py-3">
                <div>
                  <div className="text-xs text-ink-3">{t.agent.stepClient}</div>
                  <div className="text-sm font-semibold text-ink">{client.name}</div>
                </div>
                <TierBadge tier={progress.tier} size="sm" />
              </div>
              {picked.length === 0 ? (
                <EmptyState icon={PackageOpenIcon} title={t.agent.noProductsYet} body={t.agent.noProductsBody} className="py-8" />
              ) : (
                <ul className="divide-y divide-line">
                  {picked.map((p) => (
                    <li key={p.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                      <span className="min-w-0 truncate text-ink-2">
                        <span className="font-semibold text-ink tnum">{lines[p.id]}×</span> {lang === "sq" ? p.name : p.nameEn}
                      </span>
                      <Money amount={p.price * lines[p.id]} className="shrink-0 font-semibold text-ink" />
                    </li>
                  ))}
                </ul>
              )}
              <div className="flex items-center justify-between border-t border-line py-3">
                <span className="text-sm font-semibold text-ink">{t.agent.saleTotal}</span>
                <Money amount={total} className="text-base font-bold text-ink" />
              </div>
            </div>
          </div>
          <div className="mt-4 lg:mt-0">
            <div className={cn("rounded-card border p-4", projection.unlocks ? "border-wheat bg-wheat-tint/70" : "border-line bg-white")}>
              <div className="text-xs font-semibold text-ink-3">{t.agent.afterSale}</div>
              <div className="mt-2 flex items-center gap-2">
                <TierBadge tier={projection.before} size="sm" />
                <ArrowRightIcon className="size-4 text-ink-4" aria-hidden="true" />
                <TierBadge tier={projection.after} size="sm" />
              </div>
              <div className="mt-3 text-sm font-semibold text-ink tnum">{formatLek(progress.spend + total, lang)}</div>
              <MiniBar value={(progress.spend + total) / config.tiers[config.tiers.length - 1].min} className="mt-2" />
              {projection.unlocks && (
                <p className="mt-3 flex items-start gap-2 text-sm font-semibold text-ink">
                  <AwardIcon className="mt-0.5 size-4 shrink-0 text-wheat-3" aria-hidden="true" />
                  {tr(t.agent.willUnlock, { client: client.name, tier: t.tiers[projection.unlocks.id] })}
                </p>
              )}
            </div>
            {failed && (
              <div className="mt-4">
                <InlineError title={t.agent.saleError} body={t.agent.saleErrorBody} actions={<Button size="sm" onClick={submit}>{t.common.retry}</Button>} />
              </div>
            )}
            <div className="mt-4 hidden gap-2 lg:flex">
              <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                {t.common.back}
              </Button>
              <Button onClick={submit} disabled={busy || picked.length === 0} aria-busy={busy} className="flex-[2]">
                {busy ? t.agent.saving : t.agent.confirmSale}
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Sticky bottom actions (mobile), thumb zone */}
      {step === 2 && (
        <div className="fixed inset-x-0 bottom-[72px] z-30 border-t border-line bg-white/95 px-4 py-3 backdrop-blur lg:static lg:mt-6 lg:border-0 lg:bg-transparent lg:p-0">
          <Button size="lg" className="w-full justify-between lg:w-auto lg:min-w-72" onClick={() => setStep(3)} disabled={picked.length === 0}>
            <span>{t.agent.continue}</span>
            <span className="text-white/80 tnum">
              {picked.length} · <Money amount={total} />
            </span>
          </Button>
        </div>
      )}
      {step === 3 && (
        <div className="fixed inset-x-0 bottom-[72px] z-30 flex gap-2 border-t border-line bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
          <Button variant="outline" size="lg" onClick={() => setStep(2)}>
            {t.common.back}
          </Button>
          <Button size="lg" className="flex-1" onClick={submit} disabled={busy || picked.length === 0} aria-busy={busy}>
            {busy ? t.agent.saving : t.agent.confirmSale}
          </Button>
        </div>
      )}
    </div>
  );
}

function LogSaleSkeleton() {
  return (
    <LoadingRegion>
      <Skeleton className="h-7 w-40" />
      <Skeleton className="mt-3 h-4 w-80" />
      <div className="mt-5 flex gap-6">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-6 w-24" />
      </div>
      <Skeleton className="mt-6 h-5 w-32" />
      <Skeleton className="mt-3 h-11 w-full lg:max-w-sm" />
      <div className="mt-4 divide-y divide-line rounded-card border border-line bg-white">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex justify-between p-4">
            <div>
              <Skeleton className="h-4 w-40" />
              <Skeleton className="mt-2 h-3 w-24" />
            </div>
            <Skeleton className="h-6 w-16" />
          </div>
        ))}
      </div>
    </LoadingRegion>
  );
}
