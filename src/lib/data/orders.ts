import type { Order, OrderLine } from "@/lib/types";
import { productById } from "./products";
import { clients } from "./people";

/**
 * Seeded purchase history. Generated deterministically from per-client
 * profiles so the demo always shows the same tiers, expiring purchases and
 * pending orders. In production this module is replaced by a database query.
 */

// Small deterministic PRNG (mulberry32) so seed data is stable across reloads.
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface Profile {
  clientId: string;
  seed: number;
  favorites: string[];
  /** confirmed purchases inside the trailing 90 days (2026-06-18 .. 2026-09-14) */
  inWindow: { count: number; total: number };
  /** confirmed purchases just before the window (2026-05-15 .. 2026-06-17) */
  before: { count: number; total: number };
}

const profiles: Profile[] = [
  { clientId: "cl-toska", seed: 11, favorites: ["oriz-klasik", "miell-1kg", "turshi-kastravec", "turshi-miks"], inWindow: { count: 5, total: 72_000 }, before: { count: 3, total: 41_000 } },
  { clientId: "cl-iliria", seed: 12, favorites: ["oriz-basmati", "oriz-baldo", "miell-25kg", "turshi-spec-kuq", "turshi-jalapeno"], inWindow: { count: 6, total: 146_000 }, before: { count: 3, total: 58_000 } },
  { clientId: "cl-delta", seed: 13, favorites: ["oriz-klasik", "oriz-baldo", "miell-1kg", "miell-25kg", "turshi-kastravec", "turshi-kastravec-850"], inWindow: { count: 8, total: 262_000 }, before: { count: 4, total: 120_000 } },
  { clientId: "cl-vllaznimi", seed: 14, favorites: ["oriz-klasik", "miell-1kg", "turshi-kastravec-850"], inWindow: { count: 3, total: 44_000 }, before: { count: 2, total: 22_000 } },
  // cl-blini has no purchases at all (empty state)
  { clientId: "cl-jonufri", seed: 21, favorites: ["oriz-klasik", "oriz-baldo", "turshi-miks", "turshi-kastravec-850"], inWindow: { count: 5, total: 121_000 }, before: { count: 3, total: 44_000 } },
  { clientId: "cl-lekuresi", seed: 22, favorites: ["oriz-basmati", "turshi-spec-pikant", "turshi-jalapeno"], inWindow: { count: 2, total: 28_000 }, before: { count: 3, total: 35_000 } },
  { clientId: "cl-apolonia", seed: 23, favorites: ["oriz-klasik", "miell-25kg", "miell-1kg", "turshi-kastravec", "turshi-spec-kuq"], inWindow: { count: 7, total: 214_000 }, before: { count: 4, total: 96_000 } },
  { clientId: "cl-plazhi", seed: 24, favorites: ["oriz-klasik", "turshi-kastravec-850", "turshi-kastravec-vegjel"], inWindow: { count: 4, total: 58_000 }, before: { count: 2, total: 19_000 } },
  { clientId: "cl-rozafa", seed: 31, favorites: ["oriz-klasik", "oriz-baldo", "miell-1kg", "turshi-miks", "turshi-kastravec"], inWindow: { count: 6, total: 186_000 }, before: { count: 3, total: 70_000 } },
  { clientId: "cl-drini", seed: 32, favorites: ["oriz-baldo", "miell-25kg", "turshi-spec-kuq", "turshi-spec-pikant"], inWindow: { count: 4, total: 65_000 }, before: { count: 3, total: 39_000 } },
  { clientId: "cl-malesia", seed: 33, favorites: ["oriz-klasik", "miell-25kg", "miell-1kg", "turshi-kastravec", "turshi-kastravec-850", "turshi-miks"], inWindow: { count: 7, total: 232_000 }, before: { count: 4, total: 104_000 } },
  { clientId: "cl-bulevardi", seed: 34, favorites: ["oriz-klasik", "miell-1kg", "turshi-kastravec-vegjel"], inWindow: { count: 3, total: 47_000 }, before: { count: 2, total: 24_000 } },
];

function iso(d: Date) {
  return d.toISOString().slice(0, 10);
}
function addDays(d: Date, n: number) {
  const c = new Date(d);
  c.setDate(c.getDate() + n);
  return c;
}

function spreadDates(rand: () => number, from: Date, to: Date, count: number): string[] {
  const span = Math.round((to.getTime() - from.getTime()) / 86_400_000);
  const step = span / count;
  const dates: string[] = [];
  for (let i = 0; i < count; i++) {
    const jitter = Math.floor(rand() * Math.max(1, step * 0.6));
    dates.push(iso(addDays(from, Math.min(span, Math.floor(i * step) + jitter))));
  }
  return dates.sort();
}

function buildLines(rand: () => number, favorites: string[], target: number): OrderLine[] {
  const n = Math.min(favorites.length, 2 + Math.floor(rand() * 3));
  // Deterministic Fisher-Yates (a random comparator in Array.sort is engine-dependent)
  const pool = [...favorites];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  const picked = pool.slice(0, n);
  const weights = picked.map(() => 0.5 + rand());
  const wsum = weights.reduce((a, b) => a + b, 0);
  const lines: OrderLine[] = [];
  picked.forEach((pid, i) => {
    const p = productById(pid)!;
    const share = (target * weights[i]) / wsum;
    const qty = Math.max(1, Math.round(share / p.price));
    lines.push({ productId: pid, qty, unitPrice: p.price });
  });
  return lines;
}

export const sumLines = (lines: OrderLine[]) =>
  lines.reduce((s, l) => s + l.qty * l.unitPrice, 0);

/** Amount actually paid: list total minus the loyalty discount. */
export const netTotal = (lines: OrderLine[], discountPercent: number) =>
  Math.round(sumLines(lines) * (1 - discountPercent / 100));

let counter = 1000;
const nextId = () => `ORD-${++counter}`;

function generate(): Order[] {
  const out: Order[] = [];
  for (const pr of profiles) {
    const client = clients.find((c) => c.id === pr.clientId)!;
    const rand = rng(pr.seed);
    const blocks: Array<{ from: Date; to: Date; count: number; total: number }> = [
      { from: new Date("2026-05-15"), to: new Date("2026-06-17"), ...pr.before },
      { from: new Date("2026-06-19"), to: new Date("2026-09-13"), ...pr.inWindow },
    ];
    for (const b of blocks) {
      const dates = spreadDates(rand, b.from, b.to, b.count);
      const per = b.total / b.count;
      dates.forEach((date) => {
        const lines = buildLines(rand, pr.favorites, per * (0.75 + rand() * 0.5));
        out.push({
          id: nextId(),
          clientId: client.id,
          agentId: client.agentId,
          lines,
          total: sumLines(lines),
          status: "confirmed",
          source: rand() > 0.55 ? "client" : "agent",
          createdAt: date,
          decidedAt: date,
          discountPercent: 0,
        });
      });
    }
  }

  // Hand-placed orders that exercise specific states.
  const line = (productId: string, qty: number): OrderLine => ({
    productId,
    qty,
    unitPrice: productById(productId)!.price,
  });
  const manual: Array<Omit<Order, "id" | "total">> = [
    // Pending client-submitted orders awaiting agent approval
    { clientId: "cl-toska", agentId: "ag-tirane", lines: [line("oriz-klasik", 6), line("turshi-kastravec", 4)], status: "pending", source: "client", createdAt: "2026-09-15", discountPercent: 5 },
    { clientId: "cl-vllaznimi", agentId: "ag-tirane", lines: [line("miell-1kg", 5), line("turshi-kastravec-850", 3)], status: "pending", source: "client", createdAt: "2026-09-16", discountPercent: 0 },
    { clientId: "cl-jonufri", agentId: "ag-jug", lines: [line("oriz-baldo", 8), line("turshi-miks", 5)], status: "pending", source: "client", createdAt: "2026-09-16", discountPercent: 10 },
    { clientId: "cl-rozafa", agentId: "ag-veri", lines: [line("oriz-klasik", 10), line("turshi-kastravec", 6), line("miell-1kg", 4)], status: "pending", source: "client", createdAt: "2026-09-16", discountPercent: 10 },
    // A rejected one, so the status vocabulary is visible
    { clientId: "cl-plazhi", agentId: "ag-jug", lines: [line("turshi-kastravec-vegjel", 12)], status: "rejected", source: "client", createdAt: "2026-09-08", decidedAt: "2026-09-09", discountPercent: 5, note: "Produkti nuk është në gjendje këtë javë." },
  ];
  manual.forEach((m) => out.push({ ...m, id: nextId(), total: netTotal(m.lines, m.discountPercent) }));

  return out.sort((a, b) => (a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0));
}

export const seedOrders: Order[] = generate();
