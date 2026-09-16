"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FilterXIcon, ReceiptTextIcon, RotateCcwIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { LoadingRegion } from "@/components/shared/loading-region";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Chips } from "@/components/shared/chips";
import { OrderCard, OrderCardSkeleton } from "@/components/orders/order-card";
import { useI18n } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import type { Order, OrderStatus } from "@/lib/types";

type Filter = OrderStatus | "all";

export default function ClientOrdersPage() {
  const { t, tr } = useI18n();
  const { loadState, data, session, ordersFor, replaceCart } = useStore();
  const [filter, setFilter] = React.useState<Filter>("all");
  const router = useRouter();

  if (loadState !== "ready" || !data || !session?.clientId) return <OrdersSkeleton />;

  const orders = ordersFor(session.clientId);
  const shown = orders.filter((o) => filter === "all" || o.status === filter);
  const countOf = (s: OrderStatus) => orders.filter((o) => o.status === s).length;

  const reorder = (o: Order) => {
    replaceCart(o.lines.map((l) => ({ productId: l.productId, qty: l.qty })));
    toast.success(tr(t.orders.reorderToast, { n: o.lines.length }));
    router.push("/client/cart");
  };

  return (
    <div className="animate-swap">
      <PageHeader title={t.orders.title} subtitle={t.orders.subtitle} />

      {orders.length === 0 ? (
        <EmptyState
          icon={ReceiptTextIcon}
          title={t.orders.emptyTitle}
          body={t.orders.emptyBody}
          action={
            <Button asChild>
              <Link href="/client/catalog">{t.orders.emptyCta}</Link>
            </Button>
          }
          className="mt-6 rounded-card border border-dashed border-line-strong"
        />
      ) : (
        <>
          <Chips
            className="mt-6"
            label={t.common.status}
            value={filter}
            onChange={setFilter}
            options={[
              { value: "all", label: t.orders.filterAll, count: orders.length },
              { value: "pending", label: t.status.pending, count: countOf("pending") },
              { value: "confirmed", label: t.status.confirmed, count: countOf("confirmed") },
              { value: "rejected", label: t.status.rejected, count: countOf("rejected") },
            ]}
          />
          {shown.length === 0 ? (
            <EmptyState
              icon={FilterXIcon}
              title={tr(t.orders.emptyFilterTitle, { status: filter === "all" ? "" : t.status[filter].toLowerCase() })}
              body={t.orders.emptyFilterBody}
              action={
                <Button variant="outline" onClick={() => setFilter("all")}>
                  {t.orders.filterAll}
                </Button>
              }
              className="mt-6 rounded-card border border-dashed border-line-strong"
            />
          ) : (
            <ul className="mt-4 grid gap-3 lg:grid-cols-2 lg:gap-4">
              {shown.map((o) => (
                <li key={o.id}>
                  <OrderCard
                    order={o}
                    viewer="client"
                    footer={
                      <Button variant="outline" className="w-full" onClick={() => reorder(o)}>
                        <RotateCcwIcon aria-hidden="true" />
                        {t.orders.reorder}
                      </Button>
                    }
                  />
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}

function OrdersSkeleton() {
  return (
    <LoadingRegion>
      <Skeleton className="h-7 w-32" />
      <Skeleton className="mt-3 h-4 w-72" />
      <div className="mt-6 flex gap-2">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-28" />
        <Skeleton className="h-10 w-28" />
        <Skeleton className="h-10 w-24" />
      </div>
      <div className="mt-4 grid gap-3 lg:grid-cols-2 lg:gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <OrderCardSkeleton key={i} />
        ))}
      </div>
    </LoadingRegion>
  );
}
