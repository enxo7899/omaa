"use client";

import * as React from "react";
import { LogSaleFlow } from "@/components/agent/log-sale-flow";
import { useStore } from "@/lib/store";

export default function OwnerLogSalePage() {
  const { data } = useStore();
  return (
    <React.Suspense fallback={null}>
      <LogSaleFlow clients={data?.clients ?? []} clientHref="/owner/clients" />
    </React.Suspense>
  );
}
