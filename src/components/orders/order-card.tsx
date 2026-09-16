"use client";

import type { Order } from "@/lib/types";
import { useI18n } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import { formatDate } from "@/lib/format";
import { expiryDate, isInWindow } from "@/lib/loyalty";
import { StatusPill } from "@/components/shared/status-pill";
import { Money } from "@/components/shared/money";
import { cn } from "cn";

/**
 * One order, as a discrete unit (hence a card). Used by client history and
 * agent views; `footer` carries the role-specific actions.
 */
export function OrderCard({
  order,
  footer,
  heading,
  viewer,
  className,
}: {
  order: Order;
  footer?: React.ReactNode;
  heading?: React.ReactNode;
  viewer: "client" | "agent";
  className?: string;
}) {
  const { t, tr, lang } = useI18n();
  const { data, today, getProduct, getAgent } = useStore();
  const config = data!.config;
  const agent = getAgent(order.agentId);
  const inWin = isInWindow(order, today, config);
  const when = order.decidedAt ?? order.createdAt;

  const dateLine =
    order.status === "pending"
      ? tr(t.orders.placedOn, { date: formatDate(order.createdAt, lang, "long") })
      : order.status === "rejected"
        ? tr(t.orders.rejectedOn, { date: formatDate(when, lang, "long") })
        : order.source === "agent"
          ? tr(t.orders.loggedOn, { date: formatDate(when, lang, "long") })
          : tr(t.orders.confirmedOn, { date: formatDate(when, lang, "long") });

  return (
    <article className={cn("rounded-card border border-line bg-white shadow-rest", className)}>
      <div className="p-4">
        {heading}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-sm font-semibold text-ink tnum">{dateLine}</div>
            <div className="mt-0.5 text-xs text-ink-3">
              {order.source === "client" ? (viewer === "client" ? t.source.clientSelf : t.source.client) : t.source.agent}
              {order.discountPercent > 0 && <span> · {tr(t.orders.withDiscount, { pct: order.discountPercent })}</span>}
            </div>
          </div>
          <StatusPill status={order.status} />
        </div>

        <ul className="mt-3 divide-y divide-line border-y border-line text-sm">
          {order.lines.map((l) => {
            const p = getProduct(l.productId);
            const name = p ? (lang === "sq" ? p.name : p.nameEn) : l.productId;
            return (
              <li key={l.productId} className="flex items-center justify-between gap-3 py-2">
                <span className="min-w-0 truncate text-ink-2">
                  <span className="font-semibold text-ink tnum">{l.qty}×</span> {name}
                </span>
                <Money amount={l.qty * l.unitPrice} className="shrink-0 text-ink-2" />
              </li>
            );
          })}
        </ul>

        <div className="mt-3 flex items-center justify-between gap-3">
          <div className="text-xs text-ink-3">
            {order.status === "confirmed" && (
              <span className={cn("font-medium", inWin ? "text-success" : "text-ink-3")}>
                {inWin
                  ? `${tr(t.orders.counted, { days: config.windowDays })} · ${tr(t.home.expiresOn, { date: formatDate(expiryDate(when, config), lang) })}`
                  : tr(t.orders.expired, { days: config.windowDays })}
              </span>
            )}
            {order.status === "pending" && agent && viewer === "client" && <span>{tr(t.orders.pendingHint, { agent: agent.name })}</span>}
            {order.status === "rejected" && order.note && <span className="text-paprika">{tr(t.orders.rejectedReason, { note: order.note })}</span>}
          </div>
          <div className="text-right">
            <div className="text-xs text-ink-3">{t.common.total}</div>
            <Money amount={order.total} className="text-base font-bold text-ink" />
          </div>
        </div>
        {order.note && order.status !== "rejected" && <p className="mt-2 rounded-control bg-paper px-3 py-2 text-xs text-ink-2">“{order.note}”</p>}
      </div>
      {footer && <div className="border-t border-line p-3">{footer}</div>}
    </article>
  );
}

export function OrderCardSkeleton() {
  return (
    <div className="rounded-card border border-line bg-white p-4">
      <div className="flex justify-between">
        <div>
          <div className="skeleton h-4 w-40" />
          <div className="skeleton mt-2 h-3 w-28" />
        </div>
        <div className="skeleton h-7 w-24" />
      </div>
      <div className="mt-3 space-y-2 border-y border-line py-2">
        <div className="skeleton h-4 w-full" />
        <div className="skeleton h-4 w-5/6" />
      </div>
      <div className="mt-3 flex justify-between">
        <div className="skeleton h-3 w-40" />
        <div className="skeleton h-6 w-24" />
      </div>
      <div className="skeleton mt-4 h-11 w-full" />
    </div>
  );
}
