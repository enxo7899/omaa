"use client";

import { useRouter } from "next/navigation";
import { ChevronRightIcon } from "lucide-react";
import { PublicFrame } from "@/components/shell/public-frame";
import { RegionTag } from "@/components/shared/region-dot";
import { Skeleton } from "@/components/ui/skeleton";
import { LoadingRegion } from "@/components/shared/loading-region";
import { useI18n } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import { initials } from "@/lib/utils-text";

export default function AgentLoginPage() {
  const { t, tr } = useI18n();
  const { data, login, agentClients } = useStore();
  const router = useRouter();

  return (
    <PublicFrame backHref="/">
      <h1 className="text-2xl font-extrabold tracking-[-0.01em] text-ink lg:text-3xl">{t.login.pickAgent}</h1>
      <p className="mt-2 text-base text-ink-2">{t.login.pickAgentSub}</p>

      <ul className="mt-8 divide-y divide-line rounded-card border border-line bg-white shadow-rest">
        {!data
          ? Array.from({ length: 3 }).map((_, i) => (
              <li key={i} className="p-4">
                <LoadingRegion className="flex items-center gap-4">
                  <Skeleton className="size-11 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="mt-2 h-3 w-28" />
                  </div>
                </LoadingRegion>
              </li>
            ))
          : data.agents.map((agent) => (
              <li key={agent.id}>
                <button
                  type="button"
                  onClick={() => {
                    login({ role: "agent", agentId: agent.id });
                    router.push("/agent");
                  }}
                  className="flex w-full items-center gap-4 p-4 text-left transition-colors hover:bg-paper focus-visible:outline-offset-[-2px]"
                  aria-label={tr(t.login.enterAs, { name: agent.name })}
                >
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-forest-tint text-sm font-bold text-forest">
                    {initials(agent.name)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-base font-semibold text-ink">{agent.name}</span>
                    <span className="mt-0.5 flex items-center gap-3 text-xs text-ink-3">
                      <RegionTag region={agent.region} />
                      <span>{tr(t.login.clientsCount, { n: agentClients(agent.id).length })}</span>
                    </span>
                  </span>
                  <ChevronRightIcon className="size-5 shrink-0 text-ink-4" aria-hidden="true" />
                </button>
              </li>
            ))}
      </ul>
    </PublicFrame>
  );
}
