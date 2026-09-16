"use client";

import type { Product } from "@/lib/types";
import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductImage } from "@/components/shared/product-image";
import { QtyStepper } from "@/components/shared/qty-stepper";
import { Money } from "@/components/shared/money";
import { useI18n } from "@/lib/i18n";
import { cn } from "cn";

export function ProductCard({
  product,
  qty,
  onQty,
  discountPercent = 0,
  priority,
  compact,
}: {
  product: Product;
  qty: number;
  onQty: (n: number) => void;
  discountPercent?: number;
  priority?: boolean;
  compact?: boolean;
}) {
  const { t, tr, lang } = useI18n();
  const yourPrice = Math.round(product.price * (1 - discountPercent / 100));
  return (
    <article className={cn("flex flex-col rounded-card border border-line bg-white p-3 shadow-rest", qty > 0 && "border-forest/60")}>
      <ProductImage product={product} className="w-full" sizes="(min-width: 1024px) 220px, (min-width: 768px) 30vw, 45vw" priority={priority} />
      <div className="mt-3 flex flex-1 flex-col">
        <h3 className="line-clamp-2 min-h-[44px] text-sm font-semibold leading-[22px] text-ink">{lang === "sq" ? product.name : product.nameEn}</h3>
        {!compact && <p className="mt-1 line-clamp-2 min-h-[36px] text-xs leading-[18px] text-ink-3">{product.description[lang]}</p>}
        <div className="mt-2 text-xs text-ink-3">{tr(t.catalog.perUnit, { unit: product.unit[lang] })}</div>
        <div className="mt-1 flex min-h-[44px] flex-col">
          <Money amount={yourPrice} className="text-base font-bold text-ink" />
          <span className="h-[18px] text-xs text-ink-4">
            {discountPercent > 0 && <Money amount={product.price} className="line-through" />}
          </span>
        </div>
      </div>
      <div className="mt-3 h-11">
        {qty > 0 ? (
          <QtyStepper value={qty} onChange={onQty} className="w-full justify-between" label={product.name} />
        ) : (
          <Button variant="secondary" className="w-full" onClick={() => onQty(1)} aria-label={`${t.catalog.add}: ${product.name}`}>
            <PlusIcon aria-hidden="true" />
            {t.catalog.add}
          </Button>
        )}
      </div>
    </article>
  );
}

export function ProductCardSkeleton({ compact }: { compact?: boolean }) {
  return (
    <div className="rounded-card border border-line bg-white p-3">
      <div className="skeleton aspect-square w-full" />
      <div className="skeleton mt-3 h-4 w-3/4" />
      <div className="skeleton mt-2 h-4 w-1/2" />
      {!compact && <div className="skeleton mt-2 h-3 w-full" />}
      <div className="skeleton mt-3 h-3 w-1/3" />
      <div className="skeleton mt-2 h-5 w-1/2" />
      <div className="skeleton mt-3 h-11 w-full" />
    </div>
  );
}
