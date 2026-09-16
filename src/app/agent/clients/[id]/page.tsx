"use client";

import { useParams } from "next/navigation";
import { ClientDetail } from "@/components/agent/client-detail";

export default function AgentClientPage() {
  const { id } = useParams<{ id: string }>();
  return <ClientDetail clientId={id} backHref="/agent" logSaleHref="/agent/log-sale" />;
}
