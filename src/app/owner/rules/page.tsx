"use client";

import * as React from "react";
import { RotateCcwIcon, SaveIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { LoadingRegion } from "@/components/shared/loading-region";
import { PageHeader, SectionHeader } from "@/components/shared/page-header";
import { TierBadge } from "@/components/shared/tier-badge";
import { InlineError } from "@/components/shared/inline-error";
import { LangSwitch } from "@/components/shared/lang-switch";
import { DemoTools } from "@/components/shared/demo-tools";
import { useI18n } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import { defaultLoyaltyConfig } from "@/lib/data/config";
import { computeProgress, tierFor, windowSpend } from "@/lib/loyalty";
import type { LoyaltyConfig, TierId } from "@/lib/types";
import { cn } from "cn";

export default function OwnerRulesPage() {
  const { t, tr } = useI18n();
  const { loadState, data, today, saveConfig } = useStore();
  const [draftState, setDraft] = React.useState<LoyaltyConfig | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [failed, setFailed] = React.useState(false);

  if (loadState !== "ready" || !data) return <Sk />;

  const saved = data.config;
  const draft: LoyaltyConfig = draftState ?? saved;
  const dirty = JSON.stringify(saved) !== JSON.stringify(draft);
  const valid =
    draft.windowDays >= 7 &&
    draft.windowDays <= 365 &&
    draft.tiers.every((x, i) => x.min > 0 && x.discountPercent >= 0 && x.discountPercent <= 50 && (i === 0 || x.min > draft.tiers[i - 1].min));

  const setTier = (id: TierId, patch: Partial<{ min: number; discountPercent: number }>) =>
    setDraft({ ...draft, tiers: draft.tiers.map((x) => (x.id === id ? { ...x, ...patch } : x)) });

  // Live preview: how tiers would look with the draft
  const preview = data.clients.map((c) => {
    const before = tierFor(windowSpend(data.orders, c.id, today, saved), saved);
    const after = computeProgress(data.orders, c.id, today, draft).tier;
    return { before: before?.id ?? null, after: after?.id ?? null };
  });
  const changed = preview.filter((p) => p.before !== p.after).length;
  const counts = [...draft.tiers.map((x) => ({ tier: x, n: preview.filter((p) => p.after === x.id).length })).reverse(), { tier: null, n: preview.filter((p) => !p.after).length }];

  const save = async () => {
    setBusy(true);
    setFailed(false);
    try {
      await saveConfig(draft);
      setDraft(null);
      toast.success(t.owner.rulesSaved);
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  };
  const reset = () => {
    setDraft(structuredClone(defaultLoyaltyConfig));
    toast(t.owner.rulesReset);
  };

  const numberInput = (id: string, value: number, onChange: (n: number) => void, suffix: string, extra?: string) => (
    <div className="relative">
      <Input
        id={id}
        type="number"
        inputMode="numeric"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={cn("pr-14 text-right text-base font-semibold tnum", extra)}
      />
      <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xs font-medium text-ink-3">{suffix}</span>
    </div>
  );

  return (
    <div className="animate-swap">
      <PageHeader
        title={t.owner.rulesTitle}
        subtitle={t.owner.rulesSubtitle}
        action={dirty ? <span className="rounded-control bg-wheat-tint px-2.5 py-1 text-xs font-semibold text-wheat-3">{t.owner.unsaved}</span> : undefined}
      />

      <div className="mt-6 lg:grid lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:items-start lg:gap-10">
        <form
          className="rounded-card border border-line bg-white shadow-rest"
          onSubmit={(e) => {
            e.preventDefault();
            if (valid && dirty) void save();
          }}
        >
          <div className="border-b border-line p-4 lg:p-5">
            <Label htmlFor="window" className="text-sm font-semibold text-ink">
              {t.owner.windowLabel}
            </Label>
            <p className="mt-0.5 text-xs text-ink-3">{t.owner.windowHint}</p>
            <div className="mt-3 max-w-[180px]">{numberInput("window", draft.windowDays, (n) => setDraft({ ...draft, windowDays: n }), t.common.days)}</div>
          </div>

          <ol className="divide-y divide-line">
            {draft.tiers.map((tier) => (
              <li key={tier.id} className="grid gap-3 p-4 sm:grid-cols-[120px_1fr_1fr] sm:items-end lg:p-5">
                <div className="sm:pb-2.5">
                  <TierBadge tier={tier} />
                </div>
                <div>
                  <Label htmlFor={`min-${tier.id}`} className="text-xs font-medium text-ink-2">
                    {t.owner.threshold} <span className="text-ink-4">· {t.owner.thresholdHint}</span>
                  </Label>
                  <div className="mt-1.5">{numberInput(`min-${tier.id}`, tier.min, (n) => setTier(tier.id, { min: n }), t.common.lek, "border-wheat/60 focus-visible:border-wheat-2")}</div>
                </div>
                <div>
                  <Label htmlFor={`pct-${tier.id}`} className="text-xs font-medium text-ink-2">
                    {t.owner.discountPct}
                  </Label>
                  <div className="mt-1.5">{numberInput(`pct-${tier.id}`, tier.discountPercent, (n) => setTier(tier.id, { discountPercent: n }), "%", "border-wheat/60 focus-visible:border-wheat-2")}</div>
                </div>
              </li>
            ))}
          </ol>

          <div className="space-y-3 border-t border-line p-4 lg:p-5">
            {!valid && <InlineError title={t.owner.rulesInvalid} body="" />}
            {failed && <InlineError title={t.common.errorTitle} body={t.agent.saleErrorBody} actions={<Button size="sm" onClick={save}>{t.common.retry}</Button>} />}
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button type="button" variant="ghost" onClick={reset}>
                <RotateCcwIcon aria-hidden="true" />
                {t.owner.resetRules}
              </Button>
              <Button type="submit" disabled={!valid || !dirty || busy} aria-busy={busy}>
                <SaveIcon aria-hidden="true" />
                {busy ? t.common.loading : t.owner.saveRules}
              </Button>
            </div>
          </div>
        </form>

        <aside className="mt-8 lg:mt-0">
          <SectionHeader title={t.owner.livePreview} body={changed > 0 ? tr(t.owner.previewChanges, { n: changed }) : t.owner.previewNoChanges} />
          <ul className="mt-3 divide-y divide-line rounded-card border border-line bg-white px-4 shadow-rest">
            {counts.map(({ tier, n }) => (
              <li key={tier?.id ?? "none"} className="flex items-center justify-between py-3">
                <TierBadge tier={tier} size="sm" />
                <span className="text-sm font-bold text-ink tnum">
                  {n} {t.common.clients}
                </span>
              </li>
            ))}
          </ul>

          <section className="mt-8">
            <SectionHeader title={t.common.language} />
            <div className="mt-3">
              <LangSwitch />
            </div>
          </section>
          <DemoTools />
        </aside>
      </div>
    </div>
  );
}

function Sk() {
  return (
    <LoadingRegion>
      <Skeleton className="h-7 w-56" />
      <Skeleton className="mt-3 h-4 w-72" />
      <div className="mt-6 lg:grid lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:gap-10">
        <Skeleton className="h-[460px] rounded-card" />
        <div className="mt-8 lg:mt-0">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="mt-3 h-[200px] rounded-card" />
        </div>
      </div>
    </LoadingRegion>
  );
}
