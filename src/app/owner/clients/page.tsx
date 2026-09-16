"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { SearchIcon, SearchXIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { LoadingRegion } from "@/components/shared/loading-region";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Chips } from "@/components/shared/chips";
import { ClientTable, ClientTableSkeleton } from "@/components/agent/client-table";
import { useI18n } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import type { Region } from "@/lib/types";

type RegionFilter = Region | "all";

export default function OwnerClientsPage() {
  return (
    <React.Suspense fallback={<Sk />}>
      <OwnerClients />
    </React.Suspense>
  );
}

function OwnerClients() {
  const { t, tr } = useI18n();
  const { loadState, data } = useStore();
  const params = useSearchParams();
  const initial = params.get("region");
  const [region, setRegion] = React.useState<RegionFilter>(initial === "tirane" || initial === "jug" || initial === "veri" ? initial : "all");
  const [q, setQ] = React.useState("");

  if (loadState !== "ready" || !data) return <Sk />;
  const clients = data.clients.filter((c) => (region === "all" || c.region === region) && (!q || c.name.toLowerCase().includes(q.toLowerCase()) || c.city.toLowerCase().includes(q.toLowerCase())));
  const countOf = (r: Region) => data.clients.filter((c) => c.region === r).length;

  return (
    <div className="animate-swap">
      <PageHeader title={t.owner.clientsTitle} subtitle={tr(t.owner.clientsSubtitle, { n: data.clients.length })} />
      <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Chips
          label={t.owner.filterRegion}
          value={region}
          onChange={setRegion}
          options={[
            { value: "all", label: t.common.all, count: data.clients.length },
            { value: "tirane", label: t.regions.tirane, count: countOf("tirane") },
            { value: "jug", label: t.regions.jug, count: countOf("jug") },
            { value: "veri", label: t.regions.veri, count: countOf("veri") },
          ]}
        />
        <div className="relative lg:w-72">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-ink-4" aria-hidden="true" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t.agent.searchPlaceholder} aria-label={t.agent.searchPlaceholder} className="pl-10" />
        </div>
      </div>
      <div className="mt-4">
        {clients.length === 0 ? (
          <EmptyState
            icon={SearchXIcon}
            title={tr(t.agent.emptyClientsTitle, { q })}
            body={t.agent.emptyClientsBody}
            action={
              <Button
                variant="outline"
                onClick={() => {
                  setQ("");
                  setRegion("all");
                }}
              >
                {t.catalog.clearSearch}
              </Button>
            }
            className="rounded-card border border-dashed border-line-strong"
          />
        ) : (
          <ClientTable clients={clients} basePath="/owner/clients" logSalePath="/owner/log-sale" showAgent />
        )}
      </div>
    </div>
  );
}

function Sk() {
  return (
    <LoadingRegion>
      <Skeleton className="h-7 w-48" />
      <Skeleton className="mt-3 h-4 w-56" />
      <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:justify-between">
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 w-20" />
        </div>
        <Skeleton className="h-11 w-full lg:w-72" />
      </div>
      <div className="mt-4">
        <ClientTableSkeleton rows={8} />
      </div>
    </LoadingRegion>
  );
}
