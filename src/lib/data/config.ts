import type { LoyaltyConfig } from "@/lib/types";

/** Fixed simulated "today" so seeded data and progress stay demoable. */
export const TODAY = new Date("2026-09-16T12:00:00");

export const defaultLoyaltyConfig: LoyaltyConfig = {
  windowDays: 90,
  tiers: [
    { id: "bronz", min: 50_000, discountPercent: 5 },
    { id: "argjend", min: 100_000, discountPercent: 10 },
    { id: "ar", min: 200_000, discountPercent: 15 },
  ],
};
