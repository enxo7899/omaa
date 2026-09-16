"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { LogOutIcon } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import type { Role } from "@/lib/types";
import { LangSwitch } from "@/components/shared/lang-switch";
import { RegionDot } from "@/components/shared/region-dot";
import { Skeleton } from "@/components/ui/skeleton";
import { LoadingRegion } from "@/components/shared/loading-region";
import { cn } from "cn";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
  exact?: boolean;
}

export function AppShell({
  role,
  nav,
  children,
  identity,
}: {
  role: Role;
  nav: NavItem[];
  children: React.ReactNode;
  /** who is signed in: name + secondary line */
  identity: { name: string; sub?: React.ReactNode };
}) {
  const { t } = useI18n();
  const { logout } = useStore();
  const router = useRouter();
  const pathname = usePathname();

  const onLogout = () => {
    logout();
    router.replace("/");
  };

  const isActive = (item: NavItem) => (item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(item.href + "/"));

  return (
    <div className="min-h-dvh lg:flex">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col bg-forest text-white lg:sticky lg:top-0 lg:flex lg:h-dvh">
        <div className="flex items-center justify-between px-6 pt-6">
          <Brand />
          <LangSwitch tone="dark" />
        </div>
        <nav aria-label={t.roles[role]} className="mt-8 flex flex-col gap-1 px-4">
          {nav.map((item) => {
            const active = isActive(item);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-11 items-center gap-3 rounded-control px-3 text-sm font-semibold transition-colors focus-visible:outline-white",
                  active ? "bg-white/12 text-white" : "text-white/75 hover:bg-white/8 hover:text-white",
                )}
              >
                <item.icon className="size-5" strokeWidth={1.75} aria-hidden="true" />
                <span className="flex-1">{item.label}</span>
                {item.badge ? <NavBadge n={item.badge} /> : null}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto border-t border-white/12 px-6 py-5">
          <div className="text-xs font-medium text-white/60">{t.roles[role]}</div>
          {identity.name ? (
            <>
              <div className="mt-0.5 truncate text-sm font-semibold">{identity.name}</div>
              {identity.sub && <div className="mt-0.5 text-xs text-white/70">{identity.sub}</div>}
            </>
          ) : (
            <>
              <div className="mt-1.5 h-3.5 w-32 rounded-control bg-white/15" aria-hidden="true" />
              <div className="mt-2 h-3 w-16 rounded-control bg-white/10" aria-hidden="true" />
            </>
          )}
          <button
            type="button"
            onClick={onLogout}
            className="mt-4 flex h-10 w-full items-center gap-2 rounded-control bg-white/10 px-3 text-sm font-semibold text-white transition-colors hover:bg-white/16 focus-visible:outline-white"
          >
            <LogOutIcon className="size-4" aria-hidden="true" />
            {t.common.logout}
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <header className="sticky top-0 z-40 flex h-14 items-center justify-between bg-forest px-4 text-white lg:hidden">
          <div className="flex min-w-0 items-center gap-3">
            <Brand compact />
            <span className="h-5 w-px bg-white/20" aria-hidden="true" />
            <div className="min-w-0 leading-tight">
              {identity.name ? (
                <>
                  <div className="truncate text-xs font-semibold">{identity.name}</div>
                  <div className="truncate text-[11px] text-white/70">{identity.sub ?? t.roles[role]}</div>
                </>
              ) : (
                <>
                  <div className="h-3 w-24 rounded-control bg-white/15" aria-hidden="true" />
                  <div className="mt-1.5 h-2.5 w-12 rounded-control bg-white/10" aria-hidden="true" />
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <LangSwitch tone="dark" />
            <button
              type="button"
              onClick={onLogout}
              className="flex h-9 items-center gap-1.5 rounded-control px-2 text-xs font-semibold text-white/90 hover:bg-white/10 focus-visible:outline-white"
            >
              <LogOutIcon className="size-4" aria-hidden="true" />
              {t.common.logout}
            </button>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 pt-6 pb-nav lg:px-10 lg:pt-10 lg:pb-16">{children}</main>

        {/* Mobile bottom tab bar */}
        <nav
          aria-label={t.roles[role]}
          className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white pb-safe lg:hidden"
        >
          <ul className="grid h-[72px] grid-cols-4">
            {nav.map((item) => {
              const active = isActive(item);
              return (
                <li key={item.href} className="min-w-0">
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "relative flex h-full min-w-0 flex-col items-center justify-center gap-1 text-[11px] font-semibold transition-colors focus-visible:outline-offset-[-2px]",
                      active ? "text-forest" : "text-ink-3 hover:text-ink",
                    )}
                  >
                    <span className={cn("flex h-7 w-12 items-center justify-center rounded-full transition-colors", active && "bg-forest-tint")}>
                      <item.icon className="size-5" strokeWidth={active ? 2.25 : 1.75} aria-hidden="true" />
                    </span>
                    <span className="max-w-full truncate px-1">{item.label}</span>
                    {item.badge ? (
                      <span className="absolute top-2 left-1/2 ml-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-paprika px-1 text-[10px] font-bold text-white tnum">
                        {item.badge}
                      </span>
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </div>
  );
}

function NavBadge({ n }: { n: number }) {
  return <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-wheat px-1.5 text-[11px] font-bold text-ink tnum">{n}</span>;
}

export function Brand({ compact, tone = "light" }: { compact?: boolean; tone?: "light" | "dark" }) {
  const { t } = useI18n();
  return (
    <span className={cn("flex items-center gap-2", tone === "dark" ? "text-ink" : "text-white")}>
      <span className={cn("text-lg font-extrabold tracking-[0.06em]", compact && "text-base")}>OMAA</span>
      {!compact && <span className={cn("text-xs font-medium", tone === "dark" ? "text-ink-3" : "text-white/60")}>{t.common.tagline}</span>}
    </span>
  );
}

/** Identity line for agents/clients: region dot + text. */
export function IdentitySub({ region, text }: { region: "tirane" | "jug" | "veri"; text: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <RegionDot region={region} />
      {text}
    </span>
  );
}

/** Shell-shaped skeleton shown while session/data hydrate. */
export function ShellSkeleton() {
  return (
    <LoadingRegion className="min-h-dvh lg:flex">
      <div className="hidden w-64 shrink-0 bg-forest lg:block" />
      <div className="flex-1">
        <div className="h-14 bg-forest lg:hidden" />
        <div className="mx-auto w-full max-w-6xl px-4 pt-6 lg:px-10 lg:pt-10">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="mt-3 h-4 w-72" />
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <Skeleton className="h-40" />
            <Skeleton className="h-40" />
          </div>
        </div>
      </div>
    </LoadingRegion>
  );
}
