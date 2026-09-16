"use client";

import * as React from "react";
import Link from "next/link";
import { AwardIcon, CheckCheckIcon, CheckIcon, XIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LoadingRegion } from "@/components/shared/loading-region";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader, SectionHeader } from "@/components/shared/page-header";
import { RegionTag } from "@/components/shared/region-dot";
import { InlineError } from "@/components/shared/inline-error";
import { OrderCard, OrderCardSkeleton } from "@/components/orders/order-card";
import { useI18n } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import { formatLek } from "@/lib/format";
import { projectTier } from "@/lib/loyalty";
import type { Order } from "@/lib/types";

export default function AgentInboxPage() {
  const { t, tr, lang } = useI18n();
  const { loadState, data, session, agentOrders, getClient, progressFor, decideOrder } = useStore();
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const [failedId, setFailedId] = React.useState<string | null>(null);
  const [rejecting, setRejecting] = React.useState<Order | null>(null);
  const [reason, setReason] = React.useState("");

  if (loadState !== "ready" || !data || !session?.agentId) return <InboxSkeleton />;

  const orders = agentOrders(session.agentId);
  const pending = orders.filter((o) => o.status === "pending");
  const processed = orders.filter((o) => o.source === "client" && o.status !== "pending").slice(0, 4);

  const approve = async (o: Order) => {
    const client = getClient(o.clientId)!;
    setBusyId(o.id);
    setFailedId(null);
    try {
      const { change } = await decideOrder(o.id, "confirmed");
      toast.success(tr(t.agent.approveToast, { client: client.name, amount: formatLek(o.total, lang) }));
      if (change?.to) toast.success(tr(t.agent.saleUnlocked, { client: client.name, tier: t.tiers[change.to.id], pct: change.to.discountPercent }), { icon: <AwardIcon className="size-5 text-wheat-3" /> });
    } catch {
      setFailedId(o.id);
    } finally {
      setBusyId(null);
    }
  };

  const reject = async () => {
    if (!rejecting) return;
    const o = rejecting;
    const client = getClient(o.clientId)!;
    setBusyId(o.id);
    setFailedId(null);
    try {
      await decideOrder(o.id, "rejected", reason);
      toast(tr(t.agent.rejectToast, { client: client.name }));
      setRejecting(null);
      setReason("");
    } catch {
      setFailedId(o.id);
      setRejecting(null);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="animate-swap">
      <PageHeader title={t.agent.inboxTitle} subtitle={t.agent.inboxSubtitle} />

      {pending.length === 0 ? (
        <EmptyState icon={CheckCheckIcon} tone="positive" title={t.agent.inboxEmptyTitle} body={t.agent.inboxEmptyBody} className="mt-6 rounded-card border border-dashed border-line-strong" />
      ) : (
        <ul className="mt-6 grid gap-3 lg:grid-cols-2 lg:gap-4">
          {pending.map((o) => {
            const client = getClient(o.clientId)!;
            const p = progressFor(client.id);
            const projection = projectTier(p.spend, o.total, data.config);
            const busy = busyId === o.id;
            return (
              <li key={o.id}>
                <OrderCard
                  order={o}
                  viewer="agent"
                  heading={
                    <div className="mb-3 flex items-center justify-between gap-3 border-b border-line pb-3">
                      <Link href={`/agent/clients/${client.id}`} className="min-w-0">
                        <span className="block truncate text-base font-bold text-ink hover:underline">{client.name}</span>
                        <RegionTag region={client.region} withCity={client.city} className="mt-0.5" />
                      </Link>
                    </div>
                  }
                  footer={
                    <div className="space-y-3">
                      {projection.unlocks && (
                        <p className="flex items-start gap-2 rounded-control bg-wheat-tint px-3 py-2 text-xs font-semibold text-wheat-3">
                          <AwardIcon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                          {tr(t.agent.willUnlock, { client: client.name, tier: t.tiers[projection.unlocks.id] })}
                        </p>
                      )}
                      {failedId === o.id && <InlineError title={t.agent.saleError} body={t.agent.saleErrorBody} actions={<Button size="sm" onClick={() => approve(o)}>{t.common.retry}</Button>} />}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setReason("");
                            setRejecting(o);
                          }}
                          disabled={busy}
                          className="text-paprika hover:text-paprika-2"
                        >
                          <XIcon aria-hidden="true" />
                          {t.agent.reject}
                        </Button>
                        <Button className="flex-1" onClick={() => approve(o)} disabled={busy} aria-busy={busy}>
                          <CheckIcon aria-hidden="true" />
                          {busy ? t.agent.approving : t.agent.approve}
                        </Button>
                      </div>
                    </div>
                  }
                />
              </li>
            );
          })}
        </ul>
      )}

      {processed.length > 0 && (
        <section className="mt-10">
          <SectionHeader title={t.agent.processedHeading} />
          <ul className="mt-3 grid gap-3 lg:grid-cols-2 lg:gap-4">
            {processed.map((o) => {
              const client = getClient(o.clientId)!;
              return (
                <li key={o.id}>
                  <OrderCard
                    order={o}
                    viewer="agent"
                    heading={
                      <div className="mb-3 border-b border-line pb-3">
                        <Link href={`/agent/clients/${client.id}`} className="text-sm font-bold text-ink hover:underline">
                          {client.name}
                        </Link>
                      </div>
                    }
                  />
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <Dialog open={!!rejecting} onOpenChange={(o) => !o && setRejecting(null)}>
        <DialogContent closeLabel={t.common.close}>
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-ink">{t.agent.rejectTitle}</DialogTitle>
            <DialogDescription className="text-sm text-ink-2">{rejecting && tr(t.agent.rejectBody, { client: getClient(rejecting.clientId)?.name ?? "" })}</DialogDescription>
          </DialogHeader>
          <div>
            <Label htmlFor="reject-reason" className="text-xs font-medium text-ink-2">
              {t.agent.rejectReason}
            </Label>
            <Input id="reject-reason" value={reason} onChange={(e) => setReason(e.target.value)} placeholder={t.agent.rejectPlaceholder} className="mt-1.5" autoFocus />
          </div>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" onClick={() => setRejecting(null)}>
              {t.common.cancel}
            </Button>
            <Button variant="destructive" onClick={reject} disabled={busyId !== null}>
              {t.agent.rejectConfirm}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function InboxSkeleton() {
  return (
    <LoadingRegion>
      <Skeleton className="h-7 w-56" />
      <Skeleton className="mt-3 h-4 w-64" />
      <div className="mt-6 grid gap-3 lg:grid-cols-2 lg:gap-4">
        <OrderCardSkeleton />
        <OrderCardSkeleton />
      </div>
    </LoadingRegion>
  );
}
