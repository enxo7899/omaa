"use client";

import { useParams } from "next/navigation";
import { ClientDetail } from "@/components/agent/client-detail";

export default function OwnerClientPage() {
  const { id } = useParams<{ id: string }>();
  return <ClientDetail clientId={id} backHref="/owner/clients" logSaleHref="/owner/log-sale" />;
}
