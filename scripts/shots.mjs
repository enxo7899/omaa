import { chromium } from "playwright";
import fs from "node:fs";

const OUT = process.argv[2] ?? "shots";
const BASE = "http://localhost:3000";
fs.mkdirSync(OUT, { recursive: true });
const widths = [
  { w: 375, h: 812, tag: "m" },
  { w: 768, h: 1024, tag: "t" },
  { w: 1440, h: 900, tag: "d" },
];
const session = (role, extra = {}) => JSON.stringify({ role, ...extra });

// [name, path, session, options]
const scenes = [
  ["login", "/", null],
  ["login-client", "/login/client", null],
  ["client-home", "/client", session("client", { clientId: "cl-apolonia" })],
  ["client-home-bulevardi", "/client", session("client", { clientId: "cl-bulevardi" })],
  ["client-home-empty", "/client", session("client", { clientId: "cl-blini" })],
  ["client-catalog", "/client/catalog", session("client", { clientId: "cl-toska" })],
  ["client-catalog-emptysearch", "/client/catalog", session("client", { clientId: "cl-toska" }), { search: "zzz" }],
  ["client-cart", "/client/cart", session("client", { clientId: "cl-bulevardi" }), { cart: [{ productId: "oriz-klasik", qty: 4 }, { productId: "turshi-kastravec", qty: 2 }] }],
  ["client-cart-empty", "/client/cart", session("client", { clientId: "cl-toska" }), { cart: [] }],
  ["client-orders", "/client/orders", session("client", { clientId: "cl-plazhi" })],
  ["client-orders-empty", "/client/orders", session("client", { clientId: "cl-blini" })],
  ["client-account", "/client/account", session("client", { clientId: "cl-toska" })],
  ["agent-home", "/agent", session("agent", { agentId: "ag-tirane" })],
  ["agent-inbox", "/agent/inbox", session("agent", { agentId: "ag-tirane" })],
  ["agent-inbox-empty", "/agent/inbox", session("agent", { agentId: "ag-veri" }), { approveAll: true }],
  ["agent-logsale", "/agent/log-sale?client=cl-vllaznimi", session("agent", { agentId: "ag-tirane" })],
  ["agent-client", "/agent/clients/cl-jonufri", session("agent", { agentId: "ag-jug" })],
  ["agent-client-empty", "/agent/clients/cl-blini", session("agent", { agentId: "ag-tirane" })],
  ["owner-home", "/owner", session("owner")],
  ["owner-agents", "/owner/agents", session("owner")],
  ["owner-clients", "/owner/clients", session("owner")],
  ["owner-clients-empty", "/owner/clients", session("owner"), { search: "zzz" }],
  ["owner-rules", "/owner/rules", session("owner")],
  ["notfound", "/nope", null],
];

const browser = await chromium.launch();
const consoleLog = {};
for (const { w, h, tag } of widths) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, locale: "sq-AL" });
  for (const [name, path, sess, opts = {}] of scenes) {
    const page = await ctx.newPage();
    const errors = [];
    page.on("console", (m) => { if (m.type() === "error" || m.type() === "warning") errors.push(`${m.type()}: ${m.text()}`); });
    page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
    await page.goto(BASE + "/", { waitUntil: "domcontentloaded" });
    await page.evaluate(({ sess, cart }) => {
      sessionStorage.clear();
      if (sess) sessionStorage.setItem("omaa.session", sess);
      if (cart) sessionStorage.setItem("omaa.cart", JSON.stringify(cart));
    }, { sess, cart: opts.cart });
    await page.goto(BASE + path, { waitUntil: "domcontentloaded" });
    if (opts.loading) {
      await page.waitForTimeout(120);
      await page.screenshot({ path: `${OUT}/${name}-loading-${tag}.png`, fullPage: false });
    }
    // capture a loading frame for a few key scenes
    if (["client-home", "client-catalog", "agent-home", "owner-home", "client-orders"].includes(name) && tag !== "t") {
      await page.waitForTimeout(150);
      await page.screenshot({ path: `${OUT}/${name}-loading-${tag}.png`, fullPage: false });
    }
    await page.waitForTimeout(1900);
    if (opts.search) {
      await page.getByRole("textbox").first().fill(opts.search);
      await page.waitForTimeout(300);
    }
    if (opts.approveAll) {
      for (let i = 0; i < 5; i++) {
        const btn = page.getByRole("button", { name: /Konfirmo porosinë/ }).first();
        if (!(await btn.count())) break;
        await btn.click();
        await page.waitForTimeout(1200);
      }
    }
    await page.screenshot({ path: `${OUT}/${name}-${tag}.png`, fullPage: true });
    consoleLog[`${name}-${tag}`] = errors;
    await page.close();
  }
  await ctx.close();
}
await browser.close();
const bad = Object.entries(consoleLog).filter(([, e]) => e.length);
fs.writeFileSync(`${OUT}/console.json`, JSON.stringify(consoleLog, null, 2));
console.log(bad.length ? "CONSOLE ISSUES:\n" + bad.map(([k, e]) => `${k}\n  ${e.join("\n  ")}`).join("\n") : "console clean on all scenes");
