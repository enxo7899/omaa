"use client";

import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";
import { LangSwitch } from "@/components/shared/lang-switch";
import { Brand } from "./app-shell";
import { useI18n } from "@/lib/i18n";
import { cn } from "cn";

export function PublicFrame({ children, backHref, className }: { children: React.ReactNode; backHref?: string; className?: string }) {
  const { t } = useI18n();
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex h-14 items-center justify-between bg-forest px-4 text-white lg:h-16 lg:px-10">
        <div className="flex items-center gap-3">
          {backHref && (
            <Link href={backHref} className="flex h-9 items-center gap-1.5 rounded-control px-2 text-xs font-semibold text-white/90 hover:bg-white/10 focus-visible:outline-white">
              <ArrowLeftIcon className="size-4" aria-hidden="true" />
              {t.common.back}
            </Link>
          )}
          <span className="sm:hidden">
            <Brand compact />
          </span>
          <span className="hidden sm:block">
            <Brand />
          </span>
        </div>
        <LangSwitch tone="dark" />
      </header>
      <main className={cn("mx-auto w-full max-w-4xl flex-1 px-4 py-8 lg:px-10 lg:py-14", className)}>{children}</main>
      <footer className="px-4 py-6 text-center text-xs text-ink-3 lg:px-10">
        <span className="font-semibold text-ink-2">{t.common.appName}</span> · {t.common.demo} · {t.common.today}: 16.09.2026
      </footer>
    </div>
  );
}
