import { chromium } from "playwright";
const OUT = process.argv[2];
const browser = await chromium.launch();
for (const [tag, vp] of [["m", { width: 375, height: 812 }], ["d", { width: 1440, height: 900 }]]) {
  const page = await browser.newPage({ viewport: vp });
  const errs = [];
  page.on("console", (m) => { if (m.type() === "error") errs.push(m.text()); });
  await page.goto("http://localhost:3100/", { waitUntil: "networkidle" });
  await page.screenshot({ path: `${OUT}/login-admin-${tag}.png`, fullPage: true });
  await page.getByRole("button", { name: /administrator/i }).click();
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${OUT}/admin-home-${tag}.png`, fullPage: false });
  console.log(tag, page.url(), errs.length ? errs : "console clean");
  await page.close();
}
await browser.close();
