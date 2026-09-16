import type { LoyaltyConfig, Order, Tier, TierId } from "@/lib/types";

/**
 * Loyalty engine: pure functions over orders + config.
 * A rolling window of `windowDays` ending on `today` decides the tier.
 */

export const DAY_MS = 86_400_000;

export function parseDate(iso: string): Date {
  return new Date(`${iso}T12:00:00`);
}

export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function addDays(d: Date, n: number): Date {
  const c = new Date(d);
  c.setDate(c.getDate() + n);
  return c;
}

/** First day (inclusive) that still counts toward the window. */
export function windowStart(today: Date, config: LoyaltyConfig): Date {
  return addDays(today, -(config.windowDays - 1));
}

/** The day a purchase leaves the rolling window. */
export function expiryDate(purchaseDate: string, config: LoyaltyConfig): Date {
  return addDays(parseDate(purchaseDate), config.windowDays);
}

export function daysUntil(date: Date, today: Date): number {
  return Math.round((date.getTime() - today.getTime()) / DAY_MS);
}

export function isInWindow(order: Order, today: Date, config: LoyaltyConfig): boolean {
  if (order.status !== "confirmed") return false;
  const d = parseDate(order.decidedAt ?? order.createdAt);
  return d >= windowStart(today, config) && d <= today;
}

export function windowOrders(orders: Order[], clientId: string, today: Date, config: LoyaltyConfig): Order[] {
  return orders.filter((o) => o.clientId === clientId && isInWindow(o, today, config));
}

export function windowSpend(orders: Order[], clientId: string, today: Date, config: LoyaltyConfig): number {
  return windowOrders(orders, clientId, today, config).reduce((s, o) => s + o.total, 0);
}

export function tierFor(spend: number, config: LoyaltyConfig): Tier | null {
  let current: Tier | null = null;
  for (const t of config.tiers) if (spend >= t.min) current = t;
  return current;
}

export function nextTierFor(spend: number, config: LoyaltyConfig): Tier | null {
  return config.tiers.find((t) => spend < t.min) ?? null;
}

export function tierById(id: TierId | null | undefined, config: LoyaltyConfig): Tier | null {
  return config.tiers.find((t) => t.id === id) ?? null;
}

export interface ExpiringPurchase {
  order: Order;
  expiresOn: Date;
  daysLeft: number;
}

export interface LoyaltyProgress {
  spend: number;
  tier: Tier | null;
  nextTier: Tier | null;
  /** Lek still needed for the next tier (0 when at the top tier). */
  remaining: number;
  /** 0..1 progress from previous threshold (or 0) to next threshold. */
  percent: number;
  /** Overall 0..1 progress toward the top tier — used for the ring. */
  overallPercent: number;
  /** In-window purchases sorted by soonest expiry. */
  expiring: ExpiringPurchase[];
  /** Tier the client would drop to after the next expiry, if it changes. */
  dropAfterNextExpiry: { on: Date; toTier: Tier | null; amount: number } | null;
  discountPercent: number;
}

export function computeProgress(orders: Order[], clientId: string, today: Date, config: LoyaltyConfig): LoyaltyProgress {
  const inWindow = windowOrders(orders, clientId, today, config);
  const spend = inWindow.reduce((s, o) => s + o.total, 0);
  const tier = tierFor(spend, config);
  const nextTier = nextTierFor(spend, config);
  const floor = tier ? tier.min : 0;
  const ceil = nextTier ? nextTier.min : config.tiers[config.tiers.length - 1]?.min ?? 1;
  const percent = nextTier ? clamp01((spend - floor) / Math.max(1, ceil - floor)) : 1;
  const top = config.tiers[config.tiers.length - 1]?.min ?? 1;
  const overallPercent = clamp01(spend / top);

  const expiring: ExpiringPurchase[] = inWindow
    .map((order) => {
      const expiresOn = expiryDate(order.decidedAt ?? order.createdAt, config);
      return { order, expiresOn, daysLeft: daysUntil(expiresOn, today) };
    })
    .sort((a, b) => a.expiresOn.getTime() - b.expiresOn.getTime());

  let dropAfterNextExpiry: LoyaltyProgress["dropAfterNextExpiry"] = null;
  if (expiring.length > 0) {
    const first = expiring[0];
    const sameDay = expiring.filter((e) => toISODate(e.expiresOn) === toISODate(first.expiresOn));
    const amount = sameDay.reduce((s, e) => s + e.order.total, 0);
    const afterTier = tierFor(spend - amount, config);
    if ((afterTier?.id ?? null) !== (tier?.id ?? null)) {
      dropAfterNextExpiry = { on: first.expiresOn, toTier: afterTier, amount };
    }
  }

  return {
    spend,
    tier,
    nextTier,
    remaining: nextTier ? Math.max(0, nextTier.min - spend) : 0,
    percent,
    overallPercent,
    expiring,
    dropAfterNextExpiry,
    discountPercent: tier?.discountPercent ?? 0,
  };
}

/** What tier would the client reach if `extra` Lek were confirmed today. */
export function projectTier(spend: number, extra: number, config: LoyaltyConfig) {
  const before = tierFor(spend, config);
  const after = tierFor(spend + extra, config);
  const next = nextTierFor(spend + extra, config);
  return {
    before,
    after,
    unlocks: after && after.id !== before?.id ? after : null,
    remainingToNext: next ? next.min - (spend + extra) : 0,
    next,
  };
}

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}
