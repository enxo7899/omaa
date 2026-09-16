"use client";

import { useI18n } from "@/lib/i18n";
import type { Lang } from "@/lib/types";
import { cn } from "cn";

const options: Lang[] = ["sq", "en"];

export function LangSwitch({ className, tone = "light" }: { className?: string; tone?: "light" | "dark" }) {
  const { lang, setLang, t } = useI18n();
  return (
    <div
      role="group"
      aria-label={t.a11y.switchLang}
      className={cn(
        "inline-flex h-9 items-center rounded-control p-0.5",
        tone === "dark" ? "bg-white/10" : "bg-paper-2",
        className,
      )}
    >
      {options.map((o) => {
        const active = o === lang;
        return (
          <button
            key={o}
            type="button"
            aria-pressed={active}
            onClick={() => setLang(o)}
            className={cn(
              "h-8 min-w-11 rounded-[6px] px-2 text-xs font-semibold uppercase transition-colors",
              tone === "dark"
                ? active
                  ? "bg-white text-forest"
                  : "text-white/80 hover:text-white"
                : active
                  ? "bg-white text-forest shadow-rest"
                  : "text-ink-3 hover:text-ink",
            )}
          >
            {o}
          </button>
        );
      })}
    </div>
  );
}
