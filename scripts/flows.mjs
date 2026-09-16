import { chromium } from "playwright";
import fs from "node:fs";
const OUT = process.argv[2] ?? "flows";
const BASE = "http://localhost:3000";
fs.mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch();
const log = [];
const errors = [];
async function run(name, viewport, fn) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  page.on("console", (m) => { if (m.type() === "error") errors.push(`${name}: ${m.text()}`); });
  page.on("pageerror", (e) => errors.push(`${name}: pageerror ${e.message}`));
  try { await fn(page); log.push(`${name}: ok`); } catch (e) { log.push(`${name}: FAIL ${e.message.split("\n")[0]}`); await page.screenshot({ path: `${OUT}/${name}-FAIL.png` }).catch(() => {}); }
  await ctx.close();
}
const M = { width: 375, height: 812 }, D = { width: 1440, height: 900 };
const setSession = async (page, sess, extra = {}) => {
  await page.goto(BASE + "/", { waitUntil: "domcontentloaded" });
  await page.evaluate(({ sess, extra }) => { sessionStorage.clear(); sessionStorage.setItem("omaa.session", JSON.stringify(sess)); for (const [k, v] of Object.entries(extra)) (k === "lang" ? localStorage : sessionStorage).setItem(k === "lang" ? "omaa.lang" : k, typeof v === "string" ? v : JSON.stringify(v)); }, { sess, extra });
};

// 1. English layouts
for (const [tag, vp] of [["m", M], ["d", D]]) {
  await run(`en-client-home-${tag}`, vp, async (page) => {
    await setSession(page, { role: "client", clientId: "cl-bulevardi" }, { lang: "en" });
    await page.goto(BASE + "/client"); await page.waitForTimeout(2000);
    await page.screenshot({ path: `${OUT}/en-client-home-${tag}.png`, fullPage: true });
  });
  await run(`en-cart-${tag}`, vp, async (page) => {
    await setSession(page, { role: "client", clientId: "cl-bulevardi" }, { lang: "en", "omaa.cart": [{ productId: "oriz-klasik", qty: 5 }] });
    await page.goto(BASE + "/client/cart"); await page.waitForTimeout(2000);
    await page.screenshot({ path: `${OUT}/en-cart-${tag}.png`, fullPage: true });
  });
  await run(`en-agent-home-${tag}`, vp, async (page) => {
    await setSession(page, { role: "agent", agentId: "ag-jug" }, { lang: "en" });
    await page.goto(BASE + "/agent"); await page.waitForTimeout(2000);
    await page.screenshot({ path: `${OUT}/en-agent-home-${tag}.png`, fullPage: true });
  });
  await run(`en-owner-rules-${tag}`, vp, async (page) => {
    await setSession(page, { role: "owner" }, { lang: "en" });
    await page.goto(BASE + "/owner/rules"); await page.waitForTimeout(2000);
    await page.screenshot({ path: `${OUT}/en-owner-rules-${tag}.png`, fullPage: true });
  });
}

// 2. Order submit success (mobile)
await run("order-success", M, async (page) => {
  await setSession(page, { role: "client", clientId: "cl-bulevardi" }, { "omaa.cart": [{ productId: "oriz-klasik", qty: 5 }] });
  await page.goto(BASE + "/client/cart"); await page.waitForTimeout(1800);
  await page.getByRole("button", { name: /Dërgo porosinë/ }).first().click();
  await page.waitForTimeout(200);
  await page.screenshot({ path: `${OUT}/order-sending.png` });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${OUT}/order-success.png` });
  await page.getByRole("link", { name: "Shiko porositë" }).click();
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${OUT}/order-success-orders.png`, fullPage: false });
});

// 3. Order submit failure via demo toggle, then retry
await run("order-failure", M, async (page) => {
  await setSession(page, { role: "client", clientId: "cl-toska" }, { "omaa.cart": [{ productId: "turshi-miks", qty: 3 }] });
  await page.goto(BASE + "/client/account"); await page.waitForTimeout(1800);
  await page.getByRole("switch", { name: "Simulo dështim të dërgimit" }).click();
  await page.getByRole("link", { name: "Katalogu" }).first().click();
  await page.waitForTimeout(600);
  await page.getByRole("link", { name: /produkte në shporte/ }).click();
  await page.waitForTimeout(600);
  await page.getByRole("button", { name: /Dërgo porosinë/ }).first().click();
  await page.waitForTimeout(1700);
  await page.screenshot({ path: `${OUT}/order-error.png`, fullPage: true });
  await page.getByRole("button", { name: "Provo përsëri" }).click();
  await page.waitForTimeout(1700);
  await page.screenshot({ path: `${OUT}/order-error-retry-success.png` });
});

// 4. Agent approve + reject dialog (desktop)
await run("agent-approve", D, async (page) => {
  await setSession(page, { role: "agent", agentId: "ag-tirane" });
  await page.goto(BASE + "/agent/inbox"); await page.waitForTimeout(1800);
  await page.getByRole("button", { name: "Refuzo" }).first().click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${OUT}/agent-reject-dialog.png` });
  await page.getByRole("button", { name: "Anulo" }).click();
  await page.getByRole("button", { name: /Konfirmo porosinë/ }).first().click();
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${OUT}/agent-approved-toast.png` });
});

// 5. Log sale -> tier unlock -> logout -> client sees celebration (mobile)
await run("logsale-celebration", M, async (page) => {
  await setSession(page, { role: "agent", agentId: "ag-veri" });
  await page.goto(BASE + "/agent/log-sale?client=cl-bulevardi"); await page.waitForTimeout(1800);
  const add = page.getByRole("button", { name: /Shto: Oriz Klasik/ });
  await add.click();
  for (let i = 0; i < 4; i++) await page.getByRole("group", { name: "Oriz Klasik" }).getByRole("button", { name: "Rrit sasinë" }).click();
  await page.screenshot({ path: `${OUT}/logsale-step2.png` });
  await page.getByRole("button", { name: /Vazhdo/ }).click();
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${OUT}/logsale-step3.png`, fullPage: true });
  await page.getByRole("button", { name: "Shëno shitjen" }).last().click();
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${OUT}/logsale-success.png` });
  await page.getByRole("button", { name: "Dil" }).first().click();
  await page.waitForTimeout(500);
  await page.getByRole("link", { name: /Klienti/ }).click();
  await page.waitForTimeout(500);
  await page.getByRole("button", { name: "Hyr si Minimarket Bulevardi" }).click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${OUT}/celebration-ring-animating.png` });
  await page.waitForTimeout(1600);
  await page.screenshot({ path: `${OUT}/celebration-dialog.png` });
});

// 6. Rules editor live preview + save (desktop)
await run("rules-edit", D, async (page) => {
  await setSession(page, { role: "owner" });
  await page.goto(BASE + "/owner/rules"); await page.waitForTimeout(1800);
  await page.locator("#min-bronz").fill("40000");
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${OUT}/rules-preview.png` });
  await page.getByRole("button", { name: "Ruaj rregullat" }).click();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${OUT}/rules-saved.png` });
  await page.getByRole("link", { name: "Klientët" }).first().click();
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${OUT}/rules-clients-after.png`, fullPage: true });
});

// 7. Keyboard focus state
await run("focus", M, async (page) => {
  await setSession(page, { role: "client", clientId: "cl-toska" });
  await page.goto(BASE + "/client/catalog"); await page.waitForTimeout(1800);
  for (let i = 0; i < 9; i++) await page.keyboard.press("Tab");
  await page.screenshot({ path: `${OUT}/focus-catalog.png` });
});

await browser.close();
console.log(log.join("\n"));
console.log(errors.length ? "CONSOLE ERRORS:\n" + errors.join("\n") : "no console errors");
