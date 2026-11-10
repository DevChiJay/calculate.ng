// Information-architecture + page-structure checks. Usage: node ia.mjs <baseUrl> [expectedCount]
import { launch } from "./launch.mjs";
import AxeBuilder from "@axe-core/playwright";

const base = process.argv[2];
const expected = Number(process.argv[3] ?? 3);
const browser = await launch();
const results = [];
const check = (name, ok, detail = "") => {
  results.push({ name, ok });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? "  — " + detail : ""}`);
};

// ---- Content routes: structure, canonical, JSON-LD, sitemap
const sitemap = await (await fetch(base + "/sitemap.xml")).text();
const hubHtml = await (await fetch(base + "/calculators")).text();
const calcPaths = [...hubHtml.matchAll(/href="(\/[a-z0-9-]+-calculator)"/g)].map((m) => m[1]);
const unique = [...new Set(calcPaths)];
check(`hub links to ${expected} distinct calculators`, unique.length === expected, unique.join(", "));

for (const p of ["/", "/calculators", ...unique]) {
  const html = await (await fetch(base + p)).text();
  const h1 = (html.match(/<h1[\s>]/g) ?? []).length;
  const canon = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
  const ld = (html.match(/<script type="application\/ld\+json"/g) ?? []).length;
  const want = p === "/" ? "https://calculate.ng" : `https://calculate.ng${p}`;
  check(`${p}: one H1, own canonical, JSON-LD`, h1 === 1 && canon?.replace(/\/$/, "") === want && ld >= (p === "/" ? 1 : 2), `h1=${h1} canonical=${canon} ld=${ld}`);
  if (p !== "/") check(`${p}: listed in sitemap.xml`, sitemap.includes(`<loc>https://calculate.ng${p}</loc>`));
  if (unique.includes(p)) {
    check(`${p}: WebApplication + FAQPage JSON-LD, related links`, /"@type":"WebApplication"/.test(html) && /"@type":"FAQPage"/.test(html) && /More calculators/.test(html));
  }
}

// ---- Desktop header menu, keyboard
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, colorScheme: "dark" });
  const page = await ctx.newPage();
  const errors = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto(base + "/", { waitUntil: "networkidle" });
  const btn = page.getByRole("button", { name: "Calculators" });
  check("menu: collapsed by default (aria-expanded=false)", (await btn.getAttribute("aria-expanded")) === "false");
  await btn.focus();
  await page.keyboard.press("Enter");
  check("menu: Enter opens it", (await btn.getAttribute("aria-expanded")) === "true");
  const panel = page.locator("#calculators-panel");
  const links = await panel.getByRole("link").count();
  check(`menu: panel lists ${expected} calculators + All calculators`, links === expected + 1, `${links} links`);
  const headings = await panel.locator("p.uppercase").allInnerTexts();
  check("menu: three groups", headings.length === 3, headings.join(" | "));
  await page.keyboard.press("Escape");
  check("menu: Escape closes and returns focus to the button", (await btn.getAttribute("aria-expanded")) === "false" && (await btn.evaluate((el) => el === document.activeElement)));
  await btn.click();
  await page.mouse.click(900, 700);
  check("menu: outside click closes", (await btn.getAttribute("aria-expanded")) === "false");
  await btn.click();
  await panel.getByRole("link", { name: /BMI/ }).first().click();
  await page.waitForURL("**/bmi-calculator");
  check("menu: navigating closes the panel", (await page.locator("#calculators-panel").count()) === 0);
  check("menu: trigger shows active state on a calculator page", /bg-accent/.test((await page.getByRole("button", { name: "Calculators" }).getAttribute("class")) ?? ""));
  const axe = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  check("axe clean: closed menu page", axe.violations.length === 0, axe.violations.map((v) => v.id).join(","));
  await page.getByRole("button", { name: "Calculators" }).click();
  const axeOpen = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  check("axe clean: open menu", axeOpen.violations.length === 0, axeOpen.violations.map((v) => `${v.id}×${v.nodes.length}`).join(","));
  check("no console errors (desktop)", errors.length === 0, errors.join(" | ").slice(0, 200));
  await ctx.close();
}

// ---- Mobile menu + hub, both themes
for (const scheme of ["dark", "light"]) {
  const ctx = await browser.newContext({ viewport: { width: 375, height: 800 }, colorScheme: scheme });
  const page = await ctx.newPage();
  await page.goto(base + "/", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Open menu" }).click();
  const dlg = page.getByRole("dialog");
  const groupNames = await dlg.locator("p.uppercase").allInnerTexts();
  check(`[${scheme}] mobile menu: three groups`, groupNames.length === 3, groupNames.join(" | "));
  check(`[${scheme}] mobile menu: ${expected} calculators + All calculators`, (await dlg.getByRole("link").count()) === expected + 1);
  await dlg.getByRole("link", { name: "All calculators" }).click();
  await page.waitForURL("**/calculators");
  await page.waitForTimeout(400);
  check(`[${scheme}] mobile menu closes after navigating`, (await page.getByRole("dialog").count()) === 0);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  check(`[${scheme}] hub: no horizontal overflow at 375px`, overflow <= 0, `${overflow}px`);
  const axe = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  check(`[${scheme}] axe clean: hub`, axe.violations.length === 0, axe.violations.map((v) => `${v.id}×${v.nodes.length}`).join(","));
  await ctx.close();
}

await browser.close();
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} passed`);
process.exit(failed.length ? 1 : 0);
