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
  await page.goto(base + "/loan-calculator", { waitUntil: "networkidle" });
  const out = page.locator("[aria-live=polite]").last();
  const txt = async () => (await out.innerText()).replace(/\s+/g, " ");

  check(`[${scheme}] loan: placeholder before input`, /Your result appears here/.test(await txt()));
  await page.getByLabel("Loan amount").fill("500000");
  await page.getByLabel("Interest rate in percent").fill("20");
  await page.getByLabel("Loan term", { exact: true }).fill("12");
  let t = await txt();
  check(`[${scheme}] loan: reducing 20%/yr, 12 months → ≈₦46,315/month`, /Monthly payment ₦46,3\d\d/.test(t), t.slice(0, 90));
  check(`[${scheme}] loan: effective annual rate is shown`, /Effective annual rate [\d.]+%/.test(t));
  check(`[${scheme}] loan: two headline figures only`, (await out.locator("dl").first().locator("dt").count()) === 2);
  const ax = await axeRun(page);
  check(`[${scheme}] axe clean: loan result`, ax.violations.length === 0, ax.violations.map((v) => `${v.id}×${v.nodes.length}`).join(","));

  await page.getByRole("radio", { name: "Flat", exact: true }).check({ force: true });
  t = await txt();
  check(`[${scheme}] loan: flat 20%/yr → ₦50,000/month, ₦600,000 total, ₦100,000 interest`, t.includes("₦50,000") && t.includes("₦600,000") && t.includes("₦100,000"), t.slice(0, 120));
  check(`[${scheme}] loan: flat shows the reducing-balance equivalent sentence`, /A flat 20% a year works out to about \d+\.\d% a year on a reducing balance/.test(t));

  // per-month flat: ₦100,000, 5%/month, 6 months → 30,000 interest, ₦21,667/month
  await page.getByLabel("Loan amount").fill("100000");
  await page.getByLabel("Interest rate in percent").fill("5");
  await page.getByLabel("Rate period").selectOption("month");
  await page.getByLabel("Loan term", { exact: true }).fill("6");
  t = await txt();
  check(`[${scheme}] loan: 5%/month flat, 6 months → ₦21,667/month, ₦30,000 interest`, t.includes("₦21,667") && t.includes("₦30,000"), t.slice(0, 120));

  // years + fee (back to reducing)
  await page.getByRole("radio", { name: "Reducing", exact: true }).check({ force: true });
  await page.getByLabel("Loan amount").fill("500000");
  await page.getByLabel("Rate period").selectOption("year");
  await page.getByLabel("Interest rate in percent").fill("20");
  await page.getByLabel("Term unit").selectOption("years");
  await page.getByLabel("Loan term", { exact: true }).fill("1");
  t = await txt();
  check(`[${scheme}] loan: 1 year is treated as 12 months`, /for 12 months/.test(t));
  const effNoFee = Number(t.match(/Effective annual rate ([\d.]+)%/)?.[1]);
  await page.locator("summary", { hasText: "More options" }).click();
  await page.getByLabel("Upfront fee").fill("2");
  t = await txt();
  const effFee = Number(t.match(/Effective annual rate ([\d.]+)%/)?.[1]);
  check(`[${scheme}] loan: 2% fee → shows ₦10,000 fee and a higher effective rate`, t.includes("₦10,000") && effFee > effNoFee, `${effNoFee}% → ${effFee}%`);

  // schedule: collapsed, then open; 36 months → show all
  await page.getByLabel("Term unit").selectOption("months");
  await page.getByLabel("Loan term", { exact: true }).fill("36");
  const sched = out.locator("details").filter({ hasText: "Repayment schedule" });
  check(`[${scheme}] loan: schedule collapsed by default`, (await sched.getAttribute("open")) === null);
  await sched.locator("summary").click();
  check(`[${scheme}] loan: schedule previews 12 rows`, (await sched.locator("tbody tr").count()) === 12);
  await sched.getByRole("button", { name: "Show all 36 months" }).click();
  check(`[${scheme}] loan: Show all reveals 36 rows, last balance ₦0.00`, (await sched.locator("tbody tr").count()) === 36 && (await sched.locator("tbody tr").last().innerText()).includes("₦0.00"));
  const ax2 = await axeRun(page);
  check(`[${scheme}] axe clean: loan with schedule open`, ax2.violations.length === 0, ax2.violations.map((v) => `${v.id}×${v.nodes.length}`).join(","));

  // validation
  await page.getByLabel("Loan term", { exact: true }).fill("2.5");
  await page.waitForTimeout(100);
  check(`[${scheme}] loan: 2.5 months is rejected`, (await page.getByRole("alert").count()) > 0);
  await page.getByLabel("Loan term", { exact: true }).fill("12");
  await page.getByLabel("Interest rate in percent").fill("600");
  await page.waitForTimeout(100);
  check(`[${scheme}] loan: 600% a year is rejected`, (await page.getByRole("alert").count()) > 0);
  check(`[${scheme}] no console errors`, errors.length === 0, errors.join(" | ").slice(0, 200));
  await ctx.close();
}

{
  const ctx = await browser.newContext({ viewport: { width: 375, height: 800 }, colorScheme: "dark" });
  const page = await ctx.newPage();
  await page.goto(base + "/loan-calculator", { waitUntil: "networkidle" });
  await page.getByLabel("Loan amount").fill("500000");
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  check("phone 375px: no horizontal overflow", overflow <= 0, `${overflow}px`);
  const feeVisible = await page.getByLabel("Upfront fee").isVisible();
  check("phone 375px: the fee field stays hidden until More options is opened", feeVisible === false);
  if (shotDir) await page.screenshot({ path: `${shotDir}/loan-375-dark.png`, fullPage: false });
  await ctx.close();
}

await browser.close();
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} passed`);
process.exit(failed.length ? 1 : 0);
