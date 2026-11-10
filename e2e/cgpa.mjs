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

async function fillCourse(page, n, units, grade) {
  await page.getByLabel(`Course ${n} credit units`).fill(String(units));
  await page.getByLabel(`Course ${n} grade`).selectOption(grade);
}

for (const scheme of ["dark", "light"]) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 1000 }, colorScheme: scheme });
  const page = await ctx.newPage();
  const errors = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto(base + "/cgpa-calculator", { waitUntil: "networkidle" });
  const out = page.locator("[aria-live=polite]").last();

  check(`[${scheme}] cgpa: starts with 5 empty rows`, (await page.getByLabel(/Course \d+ credit units/).count()) === 5);
  check(`[${scheme}] cgpa: placeholder shown before input`, /Your result appears here/.test(await out.innerText()));

  // 3A 2B 3C 2B 1A: 15+8+9+8+5 = 45 / 11 = 4.09
  await fillCourse(page, 1, 3, "A");
  await fillCourse(page, 2, 2, "B");
  await fillCourse(page, 3, 3, "C");
  await fillCourse(page, 4, 2, "B");
  await fillCourse(page, 5, 1, "A");
  let text = await out.innerText();
  check(`[${scheme}] cgpa: example gives GPA 4.09 over 11 units`, text.includes("4.09") && text.includes("11"), text.replace(/\s+/g, " ").slice(0, 110));
  check(`[${scheme}] cgpa: 4.09 is in the Second Class Upper range (3.50 to 4.49)`, /Second Class Upper/.test(text));
  check(`[${scheme}] cgpa: two headline figures only`, (await out.locator("dl").first().locator("dt").count()) === 2);
  const ax1 = await axeRun(page);
  check(`[${scheme}] axe clean: cgpa result`, ax1.violations.length === 0, ax1.violations.map((v) => `${v.id}×${v.nodes.length}`).join(","));

  // add / remove rows, incomplete note
  await page.getByRole("button", { name: "Add course" }).click();
  check(`[${scheme}] cgpa: Add course adds a row`, (await page.getByLabel(/Course \d+ credit units/).count()) === 6);
  await page.getByLabel("Course 6 credit units").fill("4");
  await page.waitForTimeout(100);
  check(`[${scheme}] cgpa: incomplete row is reported and not counted`, /1 row needs both credit units and a grade/.test(await page.getByRole("status").first().innerText()));
  await page.getByRole("button", { name: "Remove course 6" }).click();
  check(`[${scheme}] cgpa: Remove drops the row`, (await page.getByLabel(/Course \d+ credit units/).count()) === 5);

  // earlier semesters: (3.8 × 60 + 45) / 71 = 3.845 -> 3.85, Second Class Upper
  await page.locator("summary", { hasText: "Include earlier semesters" }).click();
  await page.getByLabel("Previous CGPA").fill("3.8");
  await page.getByLabel("Previous credit units").fill("60");
  await page.waitForTimeout(100);
  text = await out.innerText();
  check(`[${scheme}] cgpa: previous record gives CGPA 3.85 over 71 units`, /Your CGPA\s*3\.85/.test(text) && text.includes("71"), text.replace(/\s+/g, " ").slice(0, 120));
  check(`[${scheme}] cgpa: class is Second Class Upper`, /Second Class Upper/.test(text));

  await page.getByLabel("Previous CGPA").fill("4.9");
  await page.getByLabel("Previous credit units").fill("200");
  await page.waitForTimeout(100);
  text = await out.innerText();
  check(`[${scheme}] cgpa: (4.9×200 + 45) / 211 = 4.86 is First Class`, /Your CGPA\s*4\.86/.test(text) && /First Class/.test(text), text.replace(/\s+/g, " ").slice(0, 120));
  await page.getByLabel("Previous CGPA").fill("3.8");
  await page.getByLabel("Previous credit units").fill("60");

  await page.getByLabel("Previous CGPA").fill("5.5");
  await page.waitForTimeout(100);
  check(`[${scheme}] cgpa: CGPA above the scale is rejected with an error`, (await page.getByRole("alert").count()) > 0);
  await page.getByLabel("Previous CGPA").fill("3.8");

  // 4.0 scale
  await fillCourse(page, 1, 3, "E");
  await page.getByRole("radio", { name: "4.0 scale" }).check({ force: true });
  await page.waitForTimeout(100);
  const options = await page.getByLabel("Course 1 grade").locator("option").allInnerTexts();
  check(`[${scheme}] cgpa: 4.0 scale has no E and cleared the old E grade`, !options.some((o) => o.startsWith("E")) && (await page.getByLabel("Course 1 grade").inputValue()) === "");
  text = await out.innerText();
  check(`[${scheme}] cgpa: 4.0 scale shows no degree class`, /not shown for the 4\.0 scale/.test(text));
  const ax2 = await axeRun(page);
  check(`[${scheme}] axe clean: cgpa 4.0 + previous`, ax2.violations.length === 0, ax2.violations.map((v) => `${v.id}×${v.nodes.length}`).join(","));
  check(`[${scheme}] no console errors`, errors.length === 0, errors.join(" | ").slice(0, 200));
  await ctx.close();
}

// Phone layout
{
  const ctx = await browser.newContext({ viewport: { width: 375, height: 800 }, colorScheme: "dark" });
  const page = await ctx.newPage();
  await page.goto(base + "/cgpa-calculator", { waitUntil: "networkidle" });
  await fillCourse(page, 1, 3, "A");
  await fillCourse(page, 2, 2, "B");
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  check("phone 375px: no horizontal overflow", overflow <= 0, `${overflow}px`);
  const box = await page.getByLabel("Course 1 credit units").boundingBox();
  check("phone 375px: inputs are at least 44px tall", box && box.height >= 44, `${box?.height}px`);
  if (shotDir) await page.screenshot({ path: `${shotDir}/cgpa-375-dark.png`, fullPage: false });
  await ctx.close();
}

await browser.close();
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} passed`);
process.exit(failed.length ? 1 : 0);
