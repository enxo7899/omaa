"use client";

import * as React from "react";
import type { Agent, CartLine, Client, LoyaltyConfig, Order, OrderLine, Product, Role, Tier } from "@/lib/types";
import { InMemoryRepository, type NewOrderInput, type Repository, type Snapshot } from "@/lib/data/repository";
import { TODAY } from "@/lib/data/config";
import { productById } from "@/lib/data/products";
import { computeProgress, tierFor, windowSpend, type LoyaltyProgress } from "@/lib/loyalty";

/* ------------------------------------------------------------------ */
/* Session                                                             */
/* ------------------------------------------------------------------ */

export interface Session {
  role: Role;
  agentId?: string;
  clientId?: string;
}

const SESSION_KEY = "omaa.session";
const CART_KEY = "omaa.cart";

function readJSON<T>(key: string): T | null {
  try {
    const raw = window.sessionStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}
function writeJSON(key: string, value: unknown) {
  try {
    if (value === null) window.sessionStorage.removeItem(key);
    else window.sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

/* ------------------------------------------------------------------ */
/* Store shape                                                         */
/* ------------------------------------------------------------------ */

export type LoadState = "idle" | "loading" | "ready" | "error";

export interface TierChange {
  clientId: string;
  from: Tier | null;
  to: Tier | null;
  at: number; // Date.now() so consumers can dedupe
}

interface StoreValue {
  today: Date;
  loadState: LoadState;
  hydrated: boolean;
  data: Snapshot | null;
  session: Session | null;
  cart: CartLine[];
  demo: { failNext: boolean; slow: boolean };
  lastTierChange: TierChange | null;

  // session
  login: (s: Session) => void;
  logout: () => void;

  // selectors
  getClient: (id: string) => Client | undefined;
  getAgent: (id: string) => Agent | undefined;
  getProduct: (id: string) => Product | undefined;
  progressFor: (clientId: string) => LoyaltyProgress;
  ordersFor: (clientId: string) => Order[];
  agentOrders: (agentId: string) => Order[];
  agentClients: (agentId: string) => Client[];

  // cart
  addToCart: (productId: string, qty?: number) => void;
  setCartQty: (productId: string, qty: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  replaceCart: (lines: CartLine[]) => void;

  // writes
  submitOrder: (input: Omit<NewOrderInput, "source" | "clientId">) => Promise<Order>;
  logSale: (clientId: string, lines: OrderLine[]) => Promise<{ order: Order; change: TierChange }>;
  decideOrder: (orderId: string, decision: "confirmed" | "rejected", note?: string) => Promise<{ order: Order; change: TierChange | null }>;
  saveConfig: (config: LoyaltyConfig) => Promise<void>;
  resetDemo: () => Promise<void>;
  reload: () => Promise<void>;
  setDemo: (patch: Partial<{ failNext: boolean; slow: boolean }>) => void;
  acknowledgeTierChange: () => void;
}

const StoreContext = React.createContext<StoreValue | null>(null);

export function AppStoreProvider({ children }: { children: React.ReactNode }) {
  // Mutable demo flags box (not a ref: read lazily by the repository callbacks)
  const [demoBox] = React.useState(() => ({ failNext: false, slow: false }));
  const [demo, setDemoState] = React.useState({ failNext: false, slow: false });

  const [repo] = React.useState<Repository>(
    () =>
      new InMemoryRepository({
        slowFactor: () => (demoBox.slow ? 4 : 1),
        failNext: () => demoBox.failNext,
        consumeFail: () => {
          demoBox.failNext = false;
          setDemoState({ ...demoBox });
        },
      }),
  );

  const [loadState, setLoadState] = React.useState<LoadState>("idle");
  const [data, setData] = React.useState<Snapshot | null>(null);
  const [session, setSession] = React.useState<Session | null>(null);
  const [cart, setCart] = React.useState<CartLine[]>([]);
  const [hydrated, setHydrated] = React.useState(false);
  const [lastTierChange, setLastTierChange] = React.useState<TierChange | null>(null);

  const load = React.useCallback(async () => {
    setLoadState("loading");
    try {
      const snap = await repo.load();
      setData(snap);
      setLoadState("ready");
    } catch {
      setLoadState("error");
    }
  }, [repo]);

  React.useEffect(() => {
    let cancelled = false;
    // Hydrate from sessionStorage in a callback (never synchronously in the effect body).
    queueMicrotask(() => {
      if (cancelled) return;
      setSession(readJSON<Session>(SESSION_KEY));
      setCart(readJSON<CartLine[]>(CART_KEY) ?? []);
      setHydrated(true);
      void load();
    });
    return () => {
      cancelled = true;
    };
  }, [load]);

  const login = React.useCallback((s: Session) => {
    setSession(s);
    writeJSON(SESSION_KEY, s);
  }, []);
  const logout = React.useCallback(() => {
    setSession(null);
    writeJSON(SESSION_KEY, null);
  }, []);

  /* selectors */
  const getClient = React.useCallback((id: string) => data?.clients.find((c) => c.id === id), [data]);
  const getAgent = React.useCallback((id: string) => data?.agents.find((a) => a.id === id), [data]);
  const getProduct = React.useCallback((id: string) => productById(id), []);
  const progressFor = React.useCallback(
    (clientId: string) => computeProgress(data?.orders ?? [], clientId, TODAY, data?.config ?? { windowDays: 90, tiers: [] }),
    [data],
  );
  const ordersFor = React.useCallback((clientId: string) => (data?.orders ?? []).filter((o) => o.clientId === clientId), [data]);
  const agentOrders = React.useCallback((agentId: string) => (data?.orders ?? []).filter((o) => o.agentId === agentId), [data]);
  const agentClients = React.useCallback((agentId: string) => (data?.clients ?? []).filter((c) => c.agentId === agentId), [data]);

  /* cart */
  const persistCart = (next: CartLine[]) => {
    setCart(next);
    writeJSON(CART_KEY, next);
  };
  const addToCart = React.useCallback((productId: string, qty = 1) => {
    setCart((prev) => {
      const existing = prev.find((l) => l.productId === productId);
      const next = existing
        ? prev.map((l) => (l.productId === productId ? { ...l, qty: l.qty + qty } : l))
        : [...prev, { productId, qty }];
      writeJSON(CART_KEY, next);
      return next;
    });
  }, []);
  const setCartQty = React.useCallback((productId: string, qty: number) => {
    setCart((prev) => {
      const next = qty <= 0 ? prev.filter((l) => l.productId !== productId) : prev.some((l) => l.productId === productId)
        ? prev.map((l) => (l.productId === productId ? { ...l, qty } : l))
        : [...prev, { productId, qty }];
      writeJSON(CART_KEY, next);
      return next;
    });
  }, []);
  const removeFromCart = React.useCallback((productId: string) => {
    setCart((prev) => {
      const next = prev.filter((l) => l.productId !== productId);
      writeJSON(CART_KEY, next);
      return next;
    });
  }, []);
  const clearCart = React.useCallback(() => persistCart([]), []);
  const replaceCart = React.useCallback((lines: CartLine[]) => persistCart(lines.filter((l) => l.qty > 0)), []);

  /* writes */
  const tierChangeFor = (orders: Order[], config: LoyaltyConfig, clientId: string, before: Order[]): TierChange => {
    const from = tierFor(windowSpend(before, clientId, TODAY, config), config);
    const to = tierFor(windowSpend(orders, clientId, TODAY, config), config);
    return { clientId, from, to, at: Date.now() };
  };

  const submitOrder = React.useCallback(
    async (input: Omit<NewOrderInput, "source" | "clientId">) => {
      if (!session?.clientId) throw new Error("NO_CLIENT_SESSION");
      const order = await repo.submitOrder({ ...input, clientId: session.clientId, source: "client" });
      setData((d) => (d ? { ...d, orders: [order, ...d.orders] } : d));
      return order;
    },
    [repo, session],
  );

  const logSale = React.useCallback(
    async (clientId: string, lines: OrderLine[]) => {
      const cfg = data?.config ?? { windowDays: 90, tiers: [] };
      const before = data?.orders ?? [];
      const spend = windowSpend(before, clientId, TODAY, cfg);
      const order = await repo.logSale({ clientId, lines, source: "agent", discountPercent: tierFor(spend, cfg)?.discountPercent ?? 0 });
      const nextOrders = [order, ...before];
      setData((d) => (d ? { ...d, orders: nextOrders } : d));
      const change = tierChangeFor(nextOrders, cfg, clientId, before);
      if (change.to && change.to.id !== change.from?.id) setLastTierChange(change);
      return { order, change };
    },
    [repo, data],
  );

  const decideOrder = React.useCallback(
    async (orderId: string, decision: "confirmed" | "rejected", note?: string) => {
      const cfg = data?.config ?? { windowDays: 90, tiers: [] };
      const before = data?.orders ?? [];
      const order = await repo.decideOrder(orderId, decision, note);
      const nextOrders = before.map((o) => (o.id === orderId ? order : o));
      setData((d) => (d ? { ...d, orders: nextOrders } : d));
      let change: TierChange | null = null;
      if (decision === "confirmed") {
        change = tierChangeFor(nextOrders, cfg, order.clientId, before);
        if (change.to && change.to.id !== change.from?.id) setLastTierChange(change);
        else change = null;
      }
      return { order, change };
    },
    [repo, data],
  );

  const saveConfig = React.useCallback(
    async (config: LoyaltyConfig) => {
      const saved = await repo.saveConfig(config);
      setData((d) => (d ? { ...d, config: saved } : d));
    },
    [repo],
  );

  const resetDemo = React.useCallback(async () => {
    const snap = await repo.reset();
    setData(snap);
    persistCart([]);
    setLastTierChange(null);
  }, [repo]);

  const setDemo = React.useCallback(
    (patch: Partial<{ failNext: boolean; slow: boolean }>) => {
      Object.assign(demoBox, patch);
      setDemoState({ ...demoBox });
    },
    [demoBox],
  );

  const acknowledgeTierChange = React.useCallback(() => setLastTierChange(null), []);

  const value: StoreValue = {
    today: TODAY,
    loadState,
    hydrated,
    data,
    session,
    cart,
    demo,
    lastTierChange,
    login,
    logout,
    getClient,
    getAgent,
    getProduct,
    progressFor,
    ordersFor,
    agentOrders,
    agentClients,
    addToCart,
    setCartQty,
    removeFromCart,
    clearCart,
    replaceCart,
    submitOrder,
    logSale,
    decideOrder,
    saveConfig,
    resetDemo,
    reload: load,
    setDemo,
    acknowledgeTierChange,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = React.useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside AppStoreProvider");
  return ctx;
}

/** Convenience: cart lines joined with product + price. */
export function useCartDetails() {
  const { cart, getProduct } = useStore();
  return React.useMemo(() => {
    const lines = cart
      .map((l) => ({ ...l, product: getProduct(l.productId)! }))
      .filter((l) => !!l.product);
    const subtotal = lines.reduce((s, l) => s + l.qty * l.product.price, 0);
    const count = lines.reduce((s, l) => s + l.qty, 0);
    return { lines, subtotal, count };
  }, [cart, getProduct]);
}
