import { seedOrders } from "../src/lib/data/orders";
import { clients } from "../src/lib/data/people";
import { defaultLoyaltyConfig, TODAY } from "../src/lib/data/config";
import { computeProgress } from "../src/lib/loyalty";
for (const c of clients) {
  const p = computeProgress(seedOrders, c.id, TODAY, defaultLoyaltyConfig);
  const all = seedOrders.filter(o=>o.clientId===c.id);
  console.log(c.name.padEnd(24), String(p.spend).padStart(7), (p.tier?.id??'-').padEnd(8), 'next', (p.nextTier?.id ?? '-').padEnd(8), 'rem', String(p.remaining).padStart(6), 'orders', String(all.length).padStart(2), 'firstExp', p.expiring[0] ? p.expiring[0].expiresOn.toISOString().slice(0,10)+' ('+p.expiring[0].order.total+')' : '-', p.dropAfterNextExpiry ? 'DROP->'+(p.dropAfterNextExpiry.toTier?.id??'none') : '');
}
console.log('total orders', seedOrders.length, 'pending', seedOrders.filter(o=>o.status==='pending').length);
