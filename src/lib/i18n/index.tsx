"use client";

import * as React from "react";
import type { Lang } from "@/lib/types";
import { sq, type Dictionary } from "@/dictionaries/sq";
import { en } from "@/dictionaries/en";

const dictionaries: Record<Lang, Dictionary> = { sq, en };

export type Vars = Record<string, string | number>;

/** Replace {name} placeholders. Numbers are inserted as-is (format them first). */
export function interpolate(template: string, vars?: Vars): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, k: string) => (vars[k] !== undefined ? String(vars[k]) : `{${k}}`));
}

interface I18nContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: Dictionary;
  tr: (template: string, vars?: Vars) => string;
}

const I18nContext = React.createContext<I18nContextValue | null>(null);

const STORAGE_KEY = "omaa.lang";

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = React.useState<Lang>("sq");

  React.useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      try {
        const saved = window.localStorage.getItem(STORAGE_KEY);
        if (saved === "sq" || saved === "en") setLangState(saved);
      } catch {
        /* storage unavailable: keep default */
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const setLang = React.useCallback((l: Lang) => {
    setLangState(l);
    try {
      window.localStorage.setItem(STORAGE_KEY, l);
    } catch {
      /* ignore */
    }
  }, []);

  React.useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const value = React.useMemo<I18nContextValue>(
    () => ({ lang, setLang, t: dictionaries[lang], tr: interpolate }),
    [lang, setLang],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = React.useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}
