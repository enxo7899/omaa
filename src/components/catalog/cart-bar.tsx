"use client";

import Link from "next/link";
import { ArrowRightIcon, ShoppingBasketIcon } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useCartDetails } from "@/lib/store";
import { Money } from "@/components/shared/money";

/** Sticky "view cart" bar that sits above the mobile tab bar. */
export function CartBar() {
  const { t, tr } = useI18n();
  const { count, subtotal } = useCartDetails();
  if (count === 0) return null;
  return (
    <div className="fixed inset-x-0 bottom-[72px] z-30 px-4 pb-2 lg:bottom-6 lg:left-64 lg:px-10">
      <Link
        href="/client/cart"
        className="mx-auto flex h-14 w-full max-w-6xl items-center gap-3 rounded-card bg-forest px-4 text-white shadow-float transition-colors hover:bg-forest-2 focus-visible:outline-white lg:max-w-md"
        aria-label={tr(t.a11y.cartCount, { n: count })}
      >
        <span className="flex size-8 items-center justify-center rounded-full bg-white/15">
          <ShoppingBasketIcon className="size-4" aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold">{t.catalog.viewCart}</span>
          <span className="block text-xs text-white/75">{tr(t.catalog.itemsInCart, { n: count })}</span>
        </span>
        <Money amount={subtotal} className="text-sm font-bold" />
        <ArrowRightIcon className="size-5" aria-hidden="true" />
      </Link>
    </div>
  );
}
