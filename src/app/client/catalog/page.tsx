"use client";

import * as React from "react";
import { SearchIcon, SearchXIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { LoadingRegion } from "@/components/shared/loading-region";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Chips } from "@/components/shared/chips";
import { ProductCard, ProductCardSkeleton } from "@/components/catalog/product-card";
import { CartBar } from "@/components/catalog/cart-bar";
import { useI18n } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import type { ProductCategory } from "@/lib/types";

type Cat = ProductCategory | "all";

export default function CatalogPage() {
  const { t, tr } = useI18n();
  const { loadState, data, session, progressFor, cart, setCartQty } = useStore();
  const [cat, setCat] = React.useState<Cat>("all");
  const [q, setQ] = React.useState("");

  if (loadState !== "ready" || !data || !session?.clientId) return <CatalogSkeleton />;

  const progress = progressFor(session.clientId);
  const products = data.products;
  const norm = (s: string) => s.toLowerCase();
  const filtered = products.filter((p) => (cat === "all" || p.category === cat) && (!q || norm(p.name).includes(norm(q)) || norm(p.nameEn).includes(norm(q))));
  const qtyOf = (id: string) => cart.find((l) => l.productId === id)?.qty ?? 0;

  const cats: { value: Cat; label: string; count: number }[] = [
    { value: "all", label: t.categories.all, count: products.length },
    { value: "oriz", label: t.categories.oriz, count: products.filter((p) => p.category === "oriz").length },
    { value: "miell", label: t.categories.miell, count: products.filter((p) => p.category === "miell").length },
    { value: "turshi", label: t.categories.turshi, count: products.filter((p) => p.category === "turshi").length },
  ];

  return (
    <div className="animate-swap pb-20">
      <PageHeader
        title={t.catalog.title}
        subtitle={progress.tier ? tr(t.catalog.subtitle, { tier: `${t.tiers[progress.tier.id]} · ${tr(t.tiers.discountOf, { pct: progress.tier.discountPercent })}` }) : t.catalog.subtitleNoTier}
      />

      <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Chips options={cats} value={cat} onChange={setCat} label={t.categories.all} />
        <div className="relative lg:w-72">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-ink-4" aria-hidden="true" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t.catalog.searchPlaceholder} aria-label={t.catalog.searchPlaceholder} className="pl-10" />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={SearchXIcon}
          title={tr(t.catalog.emptySearchTitle, { q })}
          body={t.catalog.emptySearchBody}
          action={
            <Button variant="outline" onClick={() => setQ("")}>
              {t.catalog.clearSearch}
            </Button>
          }
          className="mt-6 rounded-card border border-dashed border-line-strong"
        />
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 lg:gap-4">
          {filtered.map((p, i) => (
            <ProductCard
              key={p.id}
              product={p}
              qty={qtyOf(p.id)}
              onQty={(n) => setCartQty(p.id, n)}
              discountPercent={progress.discountPercent}
              priority={i < 8}
            />
          ))}
        </div>
      )}

      <CartBar />
    </div>
  );
}

function CatalogSkeleton() {
  return (
    <LoadingRegion>
      <Skeleton className="h-7 w-40" />
      <Skeleton className="mt-3 h-4 w-64" />
      <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:justify-between">
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 w-24" />
        </div>
        <Skeleton className="h-11 w-full lg:w-72" />
      </div>
      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 lg:gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </LoadingRegion>
  );
}
