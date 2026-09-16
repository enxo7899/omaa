"use client";

import type { Order } from "@/lib/types";
import { useI18n } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import { formatDate } from "@/lib/format";
import { expiryDate, daysUntil, isInWindow } from "@/lib/loyalty";
import { Money } from "@/components/shared/money";
import { cn } from "cn";

/** Compact list of purchases with the day each one leaves the rolling window. */
export function PurchaseRows({ orders, className }: { orders: Order[]; className?: string }) {
  const { t, tr, lang } = useI18n();
  const { data, today, getProduct } = useStore();
  const config = data!.config;
  return (
    <ul className={cn("divide-y divide-line", className)}>
      {orders.map((o) => {
        const inWin = isInWindow(o, today, config);
        const exp = expiryDate(o.decidedAt ?? o.createdAt, config);
        const days = daysUntil(exp, today);
        const summary = o.lines
          .map((l) => `${getProduct(l.productId)?.name ?? l.productId} ×${l.qty}`)
          .join(", ");
        return (
          <li key={o.id} className="flex items-start justify-between gap-4 py-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                <span className="tnum">{formatDate(o.decidedAt ?? o.createdAt, lang)}</span>
                {!inWin && <span className="rounded-control bg-paper-2 px-1.5 py-0.5 text-[11px] font-medium text-ink-3">{tr(t.home.outOfWindow, { days: config.windowDays })}</span>}
              </div>
              <div className="mt-0.5 truncate text-xs text-ink-3">{summary}</div>
              {inWin && (
                <div className="mt-1 text-xs text-ink-2">
                  {tr(t.home.expiresOn, { date: formatDate(exp, lang) })}
                  <span className={cn("ml-1.5 font-semibold tnum", days <= 7 ? "text-paprika" : "text-ink-3")}>
                    · {days === 0 ? t.home.expiresToday : days === 1 ? t.home.expiresTomorrow : tr(t.home.expiresIn, { n: days })}
                  </span>
                </div>
              )}
            </div>
            <Money amount={o.total} className={cn("shrink-0 text-sm font-bold", inWin ? "text-ink" : "text-ink-4 line-through decoration-ink-4/60")} />
          </li>
        );
      })}
    </ul>
  );
}
