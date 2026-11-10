import { launch } from "./launch.mjs";
import AxeBuilder from "@axe-core/playwright";

const base = process.argv[2];
const shotDir = process.argv[3];
const browser = await launch();
const results = [];
const check = (name, ok, detail = "") => {
  results.push({ name, ok });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? "  — " + detail : ""}`);
};
const axeRun = (page) => new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();

for (const scheme of ["dark", "light"]) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 1000 }, colorScheme: scheme });
  const page = await ctx.newPage();
  const errors = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto(base + "/vat-calculator", { waitUntil: "networkidle" });
  const out = page.locator("[aria-live=polite]").last();
  const txt = async () => (await out.innerText()).replace(/\s+/g, " ");

  check(`[${scheme}] vat: rate is prefilled with the standard 7.5`, (await page.getByLabel("VAT rate", { exact: true }).inputValue()) === "7.5");
  check(`[${scheme}] vat: placeholder before input`, /Your result appears here/.test(await txt()));

  await page.getByLabel("Price before VAT").fill("100000");
  let t = await txt();
  check(`[${scheme}] vat: add VAT to ₦100,000 → ₦7,500.00 VAT, ₦107,500.00 total`, t.includes("₦7,500.00") && t.includes("₦107,500.00"), t.slice(0, 100));
  check(`[${scheme}] vat: two headline figures only`, (await out.locator("dl").first().locator("dt").count()) === 2);
  const ax = await axeRun(page);
  check(`[${scheme}] axe clean: vat result`, ax.violations.length === 0, ax.violations.map((v) => `${v.id}×${v.nodes.length}`).join(","));

  await page.getByRole("radio", { name: "Remove VAT" }).check({ force: true });
  await page.getByLabel("Price including VAT").fill("10000");
  t = await txt();
  check(`[${scheme}] vat: remove VAT from ₦10,000 → ₦697.67 VAT, ₦9,302.33 before VAT`, t.includes("₦697.67") && t.includes("₦9,302.33"), t.slice(0, 110));
  check(`[${scheme}] vat: the label changed to the inclusive wording`, await page.getByLabel("Price including VAT").isVisible());

  await page.getByLabel("VAT rate", { exact: true }).fill("0");
  t = await txt();
  check(`[${scheme}] vat: 0% rate → ₦0.00 VAT`, t.includes("₦0.00") && /at 0%/.test(t), t.slice(0, 90));

  await page.getByLabel("VAT rate", { exact: true }).fill("150");
  await page.waitForTimeout(100);
  check(`[${scheme}] vat: 150% is rejected`, (await page.getByRole("alert").count()) > 0);
  await page.getByLabel("VAT rate", { exact: true }).fill("");
  await page.waitForTimeout(100);
  check(`[${scheme}] vat: a blank rate shows a message`, (await page.getByRole("alert").count()) > 0);

  await page.getByRole("button", { name: "Clear" }).click();
  check(`[${scheme}] vat: Clear restores 7.5 and empties the amount`, (await page.getByLabel("VAT rate", { exact: true }).inputValue()) === "7.5" && (await page.getByLabel("Price including VAT").inputValue()) === "");

  // page copy
  const body = await page.locator("main").innerText();
  check(`[${scheme}] vat page: shows rules status, Confirmed/Unverified tags and a not-modelled list`, /Rules effective 1 January 2026/.test(body) && /Confirmed/.test(body) && /Unverified/.test(body) && /Not modelled/.test(body));
  const ax2 = await axeRun(page);
  check(`[${scheme}] axe clean: vat full page`, ax2.violations.length === 0, ax2.violations.map((v) => `${v.id}×${v.nodes.length}`).join(","));
  check(`[${scheme}] no console errors`, errors.length === 0, errors.join(" | ").slice(0, 200));
  await ctx.close();
}

{
  const ctx = await browser.newContext({ viewport: { width: 375, height: 800 }, colorScheme: "dark" });
  const page = await ctx.newPage();
  await page.goto(base + "/vat-calculator", { waitUntil: "networkidle" });
  await page.getByLabel("Price before VAT").fill("100000");
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  check("phone 375px: no horizontal overflow", overflow <= 0, `${overflow}px`);
  if (shotDir) await page.screenshot({ path: `${shotDir}/vat-375-dark.png`, fullPage: false });
  await ctx.close();
}

await browser.close();
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} passed`);
process.exit(failed.length ? 1 : 0);
