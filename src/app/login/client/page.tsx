"use client";

import { useRouter } from "next/navigation";
import { ChevronRightIcon } from "lucide-react";
import { PublicFrame } from "@/components/shell/public-frame";
import { RegionTag } from "@/components/shared/region-dot";
import { TierBadge } from "@/components/shared/tier-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { LoadingRegion } from "@/components/shared/loading-region";
import { useI18n } from "@/lib/i18n";
import { useStore } from "@/lib/store";

export default function ClientLoginPage() {
  const { t, tr } = useI18n();
  const { data, login, progressFor, getAgent } = useStore();
  const router = useRouter();

  return (
    <PublicFrame backHref="/">
      <h1 className="text-2xl font-extrabold tracking-[-0.01em] text-ink lg:text-3xl">{t.login.pickClient}</h1>
      <p className="mt-2 text-base text-ink-2">{t.login.pickClientSub}</p>

      <ul className="mt-8 divide-y divide-line rounded-card border border-line bg-white shadow-rest">
        {!data
          ? Array.from({ length: 6 }).map((_, i) => (
              <li key={i} className="p-4">
                <LoadingRegion className="flex items-center gap-4">
                  <div className="flex-1">
                    <Skeleton className="h-4 w-44" />
                    <Skeleton className="mt-2 h-3 w-32" />
                  </div>
                  <Skeleton className="h-6 w-20" />
                </LoadingRegion>
              </li>
            ))
          : data.clients.map((client) => {
              const p = progressFor(client.id);
              const agent = getAgent(client.agentId);
              return (
                <li key={client.id}>
                  <button
                    type="button"
                    onClick={() => {
                      login({ role: "client", clientId: client.id });
                      router.push("/client");
                    }}
                    className="flex w-full items-center gap-4 p-4 text-left transition-colors hover:bg-paper focus-visible:outline-offset-[-2px]"
                    aria-label={tr(t.login.enterAs, { name: client.name })}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block text-base font-semibold text-ink">{client.name}</span>
                      <span className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-3">
                        <RegionTag region={client.region} withCity={client.city} />
                        <span>{t.kinds[client.kind]}</span>
                        {agent && <span className="hidden sm:inline">{tr(t.login.served, { name: agent.name })}</span>}
                      </span>
                    </span>
                    <TierBadge tier={p.tier} size="sm" />
                    <ChevronRightIcon className="size-5 shrink-0 text-ink-4" aria-hidden="true" />
                  </button>
                </li>
              );
            })}
      </ul>
    </PublicFrame>
  );
}
