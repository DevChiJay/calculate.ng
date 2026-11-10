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
const naira = (n) => "₦" + Math.round(n).toLocaleString("en-NG");

for (const scheme of ["dark", "light"]) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 1000 }, colorScheme: scheme });
  const page = await ctx.newPage();
  const errors = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto(base + "/savings-calculator", { waitUntil: "networkidle" });
  const out = page.locator("[aria-live=polite]").last();
  const txt = async () => (await out.innerText()).replace(/\s+/g, " ");

  check(`[${scheme}] savings: placeholder before input`, /Your result appears here/.test(await txt()));

  // ₦100,000 at 10% for 1 year, monthly compounding = ₦110,471
  await page.getByLabel("Starting amount").fill("100000");
  await page.getByLabel("Interest rate").fill("10");
  await page.getByLabel("Length of time").fill("1");
  let t = await txt();
  check(`[${scheme}] savings: ₦100,000 at 10% for 1 year → ₦110,471, interest ₦10,471`, t.includes("₦110,471") && t.includes("₦10,471"), t.slice(0, 100));
  check(`[${scheme}] savings: two headline figures only`, (await out.locator("dl").first().locator("dt").count()) === 2);
  const ax = await axeRun(page);
  check(`[${scheme}] axe clean: savings result`, ax.violations.length === 0, ax.violations.map((v) => `${v.id}×${v.nodes.length}`).join(","));

  // start + top-up over 5 years, compared with an independently coded formula
  await page.getByLabel("Add every month").fill("20000");
  await page.getByLabel("Length of time").fill("5");
  const r = 0.1 / 12;
  const expected = 100000 * Math.pow(1 + r, 60) + 20000 * ((Math.pow(1 + r, 60) - 1) / r);
  t = await txt();
  check(`[${scheme}] savings: ₦100k + ₦20k/month at 10% for 5 years → ${naira(expected)}`, t.includes(naira(expected)), t.slice(0, 120));
  check(`[${scheme}] savings: total paid in ₦1,300,000 is shown`, t.includes("₦1,300,000"));

  // year-by-year table
  const yt = out.locator("details").filter({ hasText: "Year-by-year growth" });
  check(`[${scheme}] savings: year table collapsed by default`, (await yt.getAttribute("open")) === null);
  await yt.locator("summary").click();
  check(`[${scheme}] savings: year table has 5 rows`, (await yt.locator("tbody tr").count()) === 5);
  check(`[${scheme}] savings: last row balance equals the headline`, (await yt.locator("tbody tr").last().innerText()).includes(naira(expected)));

  // months unit with a partial last year
  await page.getByLabel("Time unit").selectOption("months");
  await page.getByLabel("Length of time").fill("18");
  t = await txt();
  check(`[${scheme}] savings: 18 months is labelled and the last row is explained`, /after 18 months/.test(t) && /last row covers the final 6 months/.test(t));
  await page.getByLabel("Time unit").selectOption("years");
  await page.getByLabel("Length of time").fill("1");

  // compounding option (yearly): ₦100,000 at 10% once a year = ₦110,000 (no top-up)
  await page.getByLabel("Add every month").fill("");
  await page.locator("summary", { hasText: "More options" }).click();
  await page.getByLabel("Interest is added", { exact: true }).selectOption("yearly");
  t = await txt();
  check(`[${scheme}] savings: yearly compounding → ₦110,000`, t.includes("₦110,000"), t.slice(0, 90));

  // top-up only
  await page.getByLabel("Starting amount").fill("");
  await page.getByLabel("Add every month").fill("10000");
  await page.getByLabel("Interest rate").fill("0");
  await page.getByLabel("Length of time").fill("1");
  t = await txt();
  check(`[${scheme}] savings: a top-up alone works (0% for 1 year → ₦120,000)`, t.includes("₦120,000"), t.slice(0, 90));

  // validation
  await page.getByLabel("Interest rate").fill("150");
  await page.waitForTimeout(100);
  check(`[${scheme}] savings: 150% is rejected`, (await page.getByRole("alert").count()) > 0);
  await page.getByLabel("Interest rate").fill("10");
  await page.getByLabel("Time unit").selectOption("months");
  await page.getByLabel("Length of time").fill("2.5");
  await page.waitForTimeout(100);
  check(`[${scheme}] savings: 2.5 months is rejected`, (await page.getByRole("alert").count()) > 0);
  check(`[${scheme}] no console errors`, errors.length === 0, errors.join(" | ").slice(0, 200));
  await ctx.close();
}

{
  const ctx = await browser.newContext({ viewport: { width: 375, height: 800 }, colorScheme: "dark" });
  const page = await ctx.newPage();
  await page.goto(base + "/savings-calculator", { waitUntil: "networkidle" });
  await page.getByLabel("Starting amount").fill("100000");
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  check("phone 375px: no horizontal overflow", overflow <= 0, `${overflow}px`);
  check("phone 375px: compounding stays hidden until More options is opened", (await page.getByLabel("Interest is added", { exact: true }).isVisible()) === false);
  if (shotDir) await page.screenshot({ path: `${shotDir}/savings-375-dark.png`, fullPage: false });
  await ctx.close();
}

await browser.close();
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} passed`);
process.exit(failed.length ? 1 : 0);
