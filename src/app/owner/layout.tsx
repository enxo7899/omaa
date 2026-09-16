"use client";

import { LayoutDashboardIcon, SlidersHorizontalIcon, StoreIcon, UsersIcon } from "lucide-react";
import { AppShell, type NavItem } from "@/components/shell/app-shell";
import { RoleGuard } from "@/components/shell/role-guard";
import { useI18n } from "@/lib/i18n";
import { useStore } from "@/lib/store";

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard role="owner">
      <OwnerShell>{children}</OwnerShell>
    </RoleGuard>
  );
}

function OwnerShell({ children }: { children: React.ReactNode }) {
  const { t } = useI18n();
  const { data } = useStore();
  const nav: NavItem[] = [
    { href: "/owner", label: t.nav.owner.overview, icon: LayoutDashboardIcon, exact: true },
    { href: "/owner/agents", label: t.nav.owner.agents, icon: UsersIcon },
    { href: "/owner/clients", label: t.nav.owner.clients, icon: StoreIcon },
    { href: "/owner/rules", label: t.nav.owner.rules, icon: SlidersHorizontalIcon },
  ];
  return (
    <AppShell role="owner" nav={nav} identity={{ name: data?.owner.name ?? "", sub: data?.owner.company }}>
      {children}
    </AppShell>
  );
}
