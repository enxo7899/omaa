"use client";

import { InboxIcon, PlusCircleIcon, UserRoundIcon, UsersIcon } from "lucide-react";
import { AppShell, IdentitySub, type NavItem } from "@/components/shell/app-shell";
import { RoleGuard } from "@/components/shell/role-guard";
import { useI18n } from "@/lib/i18n";
import { useStore } from "@/lib/store";

export default function AgentLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard role="agent">
      <AgentShell>{children}</AgentShell>
    </RoleGuard>
  );
}

function AgentShell({ children }: { children: React.ReactNode }) {
  const { t } = useI18n();
  const { session, getAgent, agentOrders } = useStore();
  const agent = session?.agentId ? getAgent(session.agentId) : undefined;
  const pending = agent ? agentOrders(agent.id).filter((o) => o.status === "pending").length : 0;

  const nav: NavItem[] = [
    { href: "/agent", label: t.nav.agent.clients, icon: UsersIcon, exact: true },
    { href: "/agent/inbox", label: t.nav.agent.inbox, icon: InboxIcon, badge: pending || undefined },
    { href: "/agent/log-sale", label: t.nav.agent.logSale, icon: PlusCircleIcon },
    { href: "/agent/account", label: t.nav.agent.account, icon: UserRoundIcon },
  ];

  return (
    <AppShell
      role="agent"
      nav={nav}
      identity={{
        name: agent?.name ?? "",
        sub: agent ? <IdentitySub region={agent.region} text={t.regions[agent.region]} /> : undefined,
      }}
    >
      {children}
    </AppShell>
  );
}
