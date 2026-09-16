"use client";

import { HomeIcon, LayoutGridIcon, ReceiptTextIcon, UserRoundIcon } from "lucide-react";
import { AppShell, IdentitySub, type NavItem } from "@/components/shell/app-shell";
import { RoleGuard } from "@/components/shell/role-guard";
import { TierCelebration } from "@/components/loyalty/tier-celebration";
import { useI18n } from "@/lib/i18n";
import { useStore } from "@/lib/store";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard role="client">
      <ClientShell>{children}</ClientShell>
    </RoleGuard>
  );
}

function ClientShell({ children }: { children: React.ReactNode }) {
  const { t } = useI18n();
  const { session, getClient, ordersFor } = useStore();
  const client = session?.clientId ? getClient(session.clientId) : undefined;
  const pending = client ? ordersFor(client.id).filter((o) => o.status === "pending").length : 0;

  const nav: NavItem[] = [
    { href: "/client", label: t.nav.client.home, icon: HomeIcon, exact: true },
    { href: "/client/catalog", label: t.nav.client.catalog, icon: LayoutGridIcon },
    { href: "/client/orders", label: t.nav.client.orders, icon: ReceiptTextIcon, badge: pending || undefined },
    { href: "/client/account", label: t.nav.client.account, icon: UserRoundIcon },
  ];

  return (
    <AppShell
      role="client"
      nav={nav}
      identity={{
        name: client?.name ?? "",
        sub: client ? <IdentitySub region={client.region} text={client.city} /> : undefined,
      }}
    >
      {children}
      <TierCelebration />
    </AppShell>
  );
}
