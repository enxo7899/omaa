import type { Lang } from "@/lib/types";

const localeOf = (lang: Lang) => (lang === "sq" ? "sq-AL" : "en-GB");

/** "12,500 Lek" — always tabular in the UI via the `tnum` utility. */
export function formatLek(amount: number, lang: Lang = "sq"): string {
  const n = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(Math.round(amount));
  return `${n} ${lang === "sq" ? "Lekë" : "Lek"}`;
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(Math.round(n));
}

const MONTHS_SQ = ["jan", "shk", "mar", "pri", "maj", "qer", "kor", "gus", "sht", "tet", "nën", "dhj"];
const MONTHS_SQ_LONG = ["janar", "shkurt", "mars", "prill", "maj", "qershor", "korrik", "gusht", "shtator", "tetor", "nëntor", "dhjetor"];

export function formatDate(d: Date | string, lang: Lang = "sq", style: "short" | "long" = "short"): string {
  const date = typeof d === "string" ? new Date(`${d}T12:00:00`) : d;
  if (lang === "sq") {
    const m = style === "short" ? MONTHS_SQ[date.getMonth()] : MONTHS_SQ_LONG[date.getMonth()];
    return `${date.getDate()} ${m}${style === "long" ? ` ${date.getFullYear()}` : ""}`;
  }
  return new Intl.DateTimeFormat(localeOf(lang), {
    day: "numeric",
    month: style === "short" ? "short" : "long",
    ...(style === "long" ? { year: "numeric" } : {}),
  }).format(date);
}

export function percent(n: number): string {
  return `${Math.round(n * 100)}%`;
}
