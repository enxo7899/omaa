"use client";

import { useI18n } from "@/lib/i18n";
import type { OrderStatus } from "@/lib/types";
import { cn } from "cn";
import { CheckIcon, ClockIcon, XIcon } from "lucide-react";

const styles: Record<OrderStatus, string> = {
  pending: "bg-paper-2 text-ink-2",
  confirmed: "bg-success-tint text-success",
  rejected: "bg-paprika-tint text-paprika",
};

export function StatusPill({ status, className }: { status: OrderStatus; className?: string }) {
  const { t } = useI18n();
  const Icon = status === "pending" ? ClockIcon : status === "confirmed" ? CheckIcon : XIcon;
  return (
    <span className={cn("inline-flex h-7 shrink-0 items-center gap-1.5 rounded-control px-2 text-xs font-semibold whitespace-nowrap", styles[status], className)}>
      <Icon className="size-4" aria-hidden="true" strokeWidth={2} />
      {t.status[status]}
    </span>
  );
}
