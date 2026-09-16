import type { Agent, Client, LoyaltyConfig, Order, OrderLine, OrderSource, Owner, Product } from "@/lib/types";
import { products } from "./products";
import { agents, clients, owner } from "./people";
import { seedOrders, netTotal } from "./orders";
import { defaultLoyaltyConfig, TODAY } from "./config";
import { toISODate } from "@/lib/loyalty";

/**
 * Repository interface: the only surface the UI talks to for data.
 * `InMemoryRepository` is the demo implementation. A real backend would
 * implement the same interface with fetch calls and nothing else changes.
 */
export interface Snapshot {
  owner: Owner;
  agents: Agent[];
  clients: Client[];
  products: Product[];
  orders: Order[];
  config: LoyaltyConfig;
}

export interface NewOrderInput {
  clientId: string;
  lines: OrderLine[];
  source: OrderSource;
  discountPercent: number;
  note?: string;
}

export interface Repository {
  load(): Promise<Snapshot>;
  submitOrder(input: NewOrderInput): Promise<Order>;
  logSale(input: NewOrderInput): Promise<Order>;
  decideOrder(orderId: string, decision: "confirmed" | "rejected", note?: string): Promise<Order>;
  saveConfig(config: LoyaltyConfig): Promise<LoyaltyConfig>;
  reset(): Promise<Snapshot>;
}

export interface LatencyOptions {
  /** multiplier applied to every simulated delay (slow-connection demo) */
  slowFactor: () => number;
  /** when true, the next write fails once (error-state demo) */
  failNext: () => boolean;
  consumeFail: () => void;
}

export class RepositoryError extends Error {
  constructor(message = "REPOSITORY_WRITE_FAILED") {
    super(message);
    this.name = "RepositoryError";
  }
}

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export class InMemoryRepository implements Repository {
  private orders: Order[];
  private config: LoyaltyConfig;
  private counter = 5000;

  constructor(private readonly opts: LatencyOptions) {
    this.orders = seedOrders.map((o) => ({ ...o, lines: o.lines.map((l) => ({ ...l })) }));
    this.config = structuredClone(defaultLoyaltyConfig);
  }

  private async delay(base: number) {
    await wait(base * this.opts.slowFactor());
  }

  private guardFailure() {
    if (this.opts.failNext()) {
      this.opts.consumeFail();
      throw new RepositoryError();
    }
  }

  private snapshot(): Snapshot {
    return {
      owner,
      agents,
      clients,
      products,
      orders: this.orders.map((o) => ({ ...o })),
      config: structuredClone(this.config),
    };
  }

  async load(): Promise<Snapshot> {
    await this.delay(650);
    return this.snapshot();
  }

  private makeOrder(input: NewOrderInput, status: Order["status"]): Order {
    const client = clients.find((c) => c.id === input.clientId);
    if (!client) throw new RepositoryError("UNKNOWN_CLIENT");
    const today = toISODate(TODAY);
    const order: Order = {
      id: `ORD-${++this.counter}`,
      clientId: client.id,
      agentId: client.agentId,
      lines: input.lines.filter((l) => l.qty > 0).map((l) => ({ ...l })),
      total: netTotal(input.lines, input.discountPercent),
      status,
      source: input.source,
      createdAt: today,
      decidedAt: status === "confirmed" ? today : undefined,
      discountPercent: input.discountPercent,
      note: input.note?.trim() || undefined,
    };
    this.orders = [order, ...this.orders];
    return { ...order };
  }

  async submitOrder(input: NewOrderInput): Promise<Order> {
    await this.delay(900);
    this.guardFailure();
    return this.makeOrder(input, "pending");
  }

  async logSale(input: NewOrderInput): Promise<Order> {
    await this.delay(800);
    this.guardFailure();
    return this.makeOrder(input, "confirmed");
  }

  async decideOrder(orderId: string, decision: "confirmed" | "rejected", note?: string): Promise<Order> {
    await this.delay(700);
    this.guardFailure();
    const idx = this.orders.findIndex((o) => o.id === orderId);
    if (idx < 0) throw new RepositoryError("UNKNOWN_ORDER");
    const updated: Order = {
      ...this.orders[idx],
      status: decision,
      decidedAt: toISODate(TODAY),
      note: note?.trim() || this.orders[idx].note,
    };
    this.orders = this.orders.map((o) => (o.id === orderId ? updated : o));
    return { ...updated };
  }

  async saveConfig(config: LoyaltyConfig): Promise<LoyaltyConfig> {
    await this.delay(500);
    this.guardFailure();
    this.config = structuredClone(config);
    return structuredClone(this.config);
  }

  async reset(): Promise<Snapshot> {
    await this.delay(500);
    this.orders = seedOrders.map((o) => ({ ...o }));
    this.config = structuredClone(defaultLoyaltyConfig);
    this.counter = 5000;
    return this.snapshot();
  }
}
