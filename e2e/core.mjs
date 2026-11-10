// Usage: node e2e.mjs <baseUrl>
import { launch } from "./launch.mjs";
import AxeBuilder from "@axe-core/playwright";

const base = process.argv[2];
const browser = await launch();
const results = [];
const check = (name, ok, detail = "") => {
  results.push({ name, ok });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? "  — " + detail : ""}`);
};

async function axeNodes(page, label) {
  const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  check(`axe clean: ${label}`, r.violations.length === 0, r.violations.map((v) => `${v.id}×${v.nodes.length}`).join(", "));
}

for (const scheme of ["dark", "light"]) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, colorScheme: scheme });
  const page = await ctx.newPage();
  const errors = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(String(e)));

  // ---- Tax
  await page.goto(base + "/tax-calculator", { waitUntil: "networkidle" });
  await page.getByLabel("Gross income per month").fill("500000");
  const out = page.locator("[aria-live=polite]").last();
  await out.getByText("PAYE tax per month").waitFor();
  let text = await out.innerText();
  check(`[${scheme}] tax: ₦500k/month → PAYE ₦72,500/month`, text.includes("₦72,500"), text.match(/₦[\d,]+/)?.[0]);
  check(`[${scheme}] tax: shows 18% marginal band & workings`, /18%/.test(text) && /Taxable income/.test(text));
  check(`[${scheme}] tax: old-vs-new comparison present`, /previous rules/.test(text));
  await page.waitForTimeout(500);
  check(`[${scheme}] tax: address bar is a shareable link`, page.url().includes("income=500000"), page.url());
  await axeNodes(page, `tax result (${scheme})`);

  await page.getByRole("radio", { name: "Year" }).check({ force: true });
  await page.getByLabel("Gross income per year").fill("6000000");
  await page.getByLabel(/Rent you pay per year/).fill("1200000");
  await page.waitForTimeout(300);
  text = await out.innerText();
  check(`[${scheme}] tax: ₦6m/yr + ₦1.2m rent → relief ₦240,000`, text.includes("₦240,000"));

  await page.getByLabel("Gross income per year").fill("0");
  await page.waitForTimeout(200);
  check(`[${scheme}] tax: zero income shows a field error`, (await page.getByRole("alert").count()) > 0);

  await page.goto(base + "/tax-calculator?income=3000000&period=annual", { waitUntil: "networkidle" });
  await page.waitForTimeout(300);
  check(`[${scheme}] tax: shared link restores inputs`, (await page.getByLabel("Gross income per year").inputValue()) === "3000000");
  text = await page.locator("[aria-live=polite]").last().innerText();
  check(`[${scheme}] tax: shared link computes ₦330,000 on ₦3m`, text.includes("₦330,000"));

  // ---- BMI
  await page.goto(base + "/bmi-calculator", { waitUntil: "networkidle" });
  await page.getByLabel("Weight (kg)").fill("70");
  await page.getByLabel("Height (cm)").fill("175");
  text = await page.locator("[aria-live=polite]").last().innerText();
  check(`[${scheme}] bmi: 70kg/175cm → 22.9 Healthy weight`, text.includes("22.9") && text.includes("Healthy weight"));
  await axeNodes(page, `bmi result (${scheme})`);
  await page.getByRole("radio", { name: /Imperial/ }).check({ force: true });
  await page.getByLabel("Weight (lb)").fill("154");
  await page.getByLabel("Height (feet)").fill("0");
  await page.getByLabel("Inches").fill("0");
  await page.waitForTimeout(150);
  check(`[${scheme}] bmi: 0 ft 0 in shows an error, no crash`, (await page.getByRole("alert").count()) > 0);

  // ---- Inflation
  await page.goto(base + "/inflation-calculator", { waitUntil: "networkidle" });
  await page.getByLabel("Amount (₦)").fill("100000");
  text = await page.locator("[aria-live=polite]").last().innerText();
  check(`[${scheme}] inflation: result renders with equivalent amount`, /you would need/.test(text) && /Buying power/.test(text), text.replace(/\s+/g, " ").slice(0, 120));
  await axeNodes(page, `inflation result (${scheme})`);

  check(`[${scheme}] no console/page errors`, errors.length === 0, errors.join(" | ").slice(0, 300));
  await ctx.close();
}

// ---- Mobile menu
{
  const ctx = await browser.newContext({ viewport: { width: 375, height: 800 }, colorScheme: "dark" });
  const page = await ctx.newPage();
  await page.goto(base + "/", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Open menu" }).click();
  const dialog = page.getByRole("dialog");
  check("mobile: menu opens", await dialog.isVisible());
  await dialog.getByRole("link", { name: "BMI" }).click();
  await page.waitForURL("**/bmi-calculator");
  await page.waitForTimeout(400);
  check("mobile: menu closes after navigating", (await page.getByRole("dialog").count()) === 0);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  check("mobile: no horizontal overflow at 375px", overflow <= 0, `${overflow}px`);

  // keyboard: theme toggle cycles
  await page.getByRole("button", { name: /^Theme:/ }).first().click().catch(() => {});
  await ctx.close();
}

await browser.close();
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} passed`);
process.exit(failed.length ? 1 : 0);
