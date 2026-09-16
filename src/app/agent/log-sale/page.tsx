"use client";

import * as React from "react";
import { LogSaleFlow } from "@/components/agent/log-sale-flow";
import { useStore } from "@/lib/store";

export default function AgentLogSalePage() {
  const { session, agentClients } = useStore();
  const clients = session?.agentId ? agentClients(session.agentId) : [];
  return (
    <React.Suspense fallback={null}>
      <LogSaleFlow clients={clients} clientHref="/agent/clients" />
    </React.Suspense>
  );
}
