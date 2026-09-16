/**
 * Domain models for the OMAA loyalty & ordering demo.
 * These are the shapes a real backend would return; the in-memory repository
 * in `lib/data` is the only thing that would change when a database arrives.
 */

export type Lang = "sq" | "en";

export type Localized = { sq: string; en: string };

export type Region = "tirane" | "jug" | "veri";

export type Role = "owner" | "agent" | "client";

export interface Owner {
  id: string;
  name: string;
  company: string;
}

export interface Agent {
  id: string;
  name: string;
  region: Region;
  phone: string; // E.164 without "+", used for wa.me
  email: string;
}

export interface Client {
  id: string;
  name: string;
  city: string;
  region: Region;
  agentId: string;
  contactName: string;
  phone: string;
  kind: "shop" | "restaurant" | "reseller";
}

export type ProductCategory = "oriz" | "miell" | "turshi";

export interface Product {
  id: string;
  name: string; // Albanian product name is the canonical brand name
  nameEn: string;
  category: ProductCategory;
  description: Localized;
  unit: Localized; // e.g. "Bax (10 × 1 kg)"
  price: number; // wholesale price per unit, Lek (ALL)
  image: string; // local path under /public
  imageFallback: string; // hotlinked URL if local asset is missing
}

export interface OrderLine {
  productId: string;
  qty: number;
  unitPrice: number; // price at time of order
}

export type OrderStatus = "pending" | "confirmed" | "rejected";
export type OrderSource = "agent" | "client";

export interface Order {
  id: string;
  clientId: string;
  agentId: string;
  lines: OrderLine[];
  total: number;
  status: OrderStatus;
  source: OrderSource;
  createdAt: string; // ISO date (YYYY-MM-DD)
  decidedAt?: string; // ISO date when confirmed / rejected
  discountPercent: number; // loyalty discount applied at the time
  note?: string;
}

export type TierId = "bronz" | "argjend" | "ar";

export interface Tier {
  id: TierId;
  min: number; // Lek in trailing window
  discountPercent: number;
}

export interface LoyaltyConfig {
  windowDays: number;
  tiers: Tier[]; // sorted ascending by min
}

export interface CartLine {
  productId: string;
  qty: number;
}
