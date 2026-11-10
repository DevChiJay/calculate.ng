import { launch } from "./launch.mjs";
import AxeBuilder from "@axe-core/playwright";

const base = process.argv[2];
const browser = await launch();
const results = [];
const check = (name, ok, detail = "") => {
  results.push({ name, ok });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? "  — " + detail : ""}`);
};
const axeRun = (page) => new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();

for (const scheme of ["dark", "light"]) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, colorScheme: scheme });
  const page = await ctx.newPage();
  const errors = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(String(e)));

  await page.goto(base + "/net-to-gross-calculator", { waitUntil: "networkidle" });
  await page.getByLabel("Take-home pay you want per month").fill("500000");
  const out = page.locator("[aria-live=polite]").last();
  await out.getByText("Gross pay needed per month").waitFor();
  let text = await out.innerText();
  check(`[${scheme}] n2g: ₦500k/month take-home → ₦588,415 gross/month`, text.includes("₦588,415"), text.match(/₦[\d,]+/)?.[0]);
  check(`[${scheme}] n2g: shows PAYE tax per month and yearly gross`, /PAYE tax per month/.test(text) && text.includes("₦7,060,976"));
  check(`[${scheme}] n2g: at most two headline figures`, (await out.locator("dl").first().locator("dt").count()) === 2);

  const details = out.locator("details").filter({ hasText: "Show the workings" });
  check(`[${scheme}] n2g: workings are collapsed by default`, (await details.getAttribute("open")) === null);
  await details.locator("summary").click();
  check(`[${scheme}] n2g: workings open to a band table`, (await details.getByRole("table").count()) === 1);
  await page.waitForTimeout(500);
  check(`[${scheme}] n2g: address bar is a shareable link`, page.url().includes("takehome=500000"), page.url());
  const ax = await axeRun(page);
  check(`[${scheme}] axe clean: n2g result`, ax.violations.length === 0, ax.violations.map((v) => `${v.id}×${v.nodes.length}`).join(","));

  // Rent relief reduces the gross needed
  const noRent = Number(text.match(/needed per month\s*₦([\d,]+)/)?.[1].replace(/,/g, ""));
  await page.getByLabel(/Rent you pay per month/).fill("100000");
  await page.waitForTimeout(150);
  text = await out.innerText();
  const withRent = Number(text.match(/needed per month\s*₦([\d,]+)/)?.[1].replace(/,/g, ""));
  check(`[${scheme}] n2g: rent relief lowers the gross needed`, withRent < noRent, `${noRent} → ${withRent}`);

  // Round trip into the PAYE calculator
  await page.getByLabel(/Rent you pay per month/).fill("");
  await page.waitForTimeout(150);
  await page.getByRole("link", { name: "Check it there" }).click();
  await page.waitForURL("**/tax-calculator?**");
  await page.waitForTimeout(400);
  const paye = await page.locator("[aria-live=polite]").last().innerText();
  check(`[${scheme}] round trip: PAYE page shows take-home ₦500,000/month`, /take-home per month\s*₦500,000/.test(paye), paye.replace(/\s+/g, " ").slice(0, 160));
  await page.getByRole("link", { name: "Try the net-to-gross calculator" }).click();
  await page.waitForURL("**/net-to-gross-calculator");
  check(`[${scheme}] PAYE → net-to-gross cross-link works`, true);

  // Validation
  await page.getByLabel("Take-home pay you want per month").fill("0");
  await page.waitForTimeout(150);
  check(`[${scheme}] n2g: zero shows a field error`, (await page.getByRole("alert").count()) > 0);

  check(`[${scheme}] no console errors`, errors.length === 0, errors.join(" | ").slice(0, 200));
  await ctx.close();
}

await browser.close();
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} passed`);
process.exit(failed.length ? 1 : 0);
