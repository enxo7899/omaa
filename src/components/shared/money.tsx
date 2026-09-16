"use client";

import { useI18n } from "@/lib/i18n";
import { formatLek } from "@/lib/format";
import { cn } from "cn";

export function Money({ amount, className, signed }: { amount: number; className?: string; signed?: boolean }) {
  const { lang } = useI18n();
  const text = formatLek(Math.abs(amount), lang);
  return (
    <span className={cn("tnum whitespace-nowrap", className)}>
      {signed && amount < 0 ? "−" : ""}
      {text}
    </span>
  );
}

export function useMoney() {
  const { lang } = useI18n();
  return (amount: number) => formatLek(amount, lang);
}
