/**
 * Browser regression suite. Usage: npm run build && npm run e2e
 * Starts the production server, runs every check script against it, and exits non-zero if any fail.
 * Drives the installed Google Chrome by default (see e2e/launch.mjs); no browser download needed.
 */
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PORT = process.env.E2E_PORT ?? "3199";
const base = `http://localhost:${PORT}`;
const CALCULATORS = 8; // keep in step with src/lib/site.ts (the unit tests guard the registry itself)

const server = spawn("npx", ["next", "start", "-p", PORT], { cwd: root, stdio: "ignore" });
const stop = () => server.kill();
process.on("exit", stop);

async function waitUp() {
  for (let i = 0; i < 60; i++) {
    try {
      if ((await fetch(base)).ok) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error("Server did not start. Did you run `npm run build` first?");
}

const run = (script, args = []) =>
  new Promise((resolve) => {
    const p = spawn("node", [path.join(root, "e2e", script), base, ...args], { stdio: "inherit" });
    p.on("exit", (code) => resolve(code ?? 1));
  });

try {
  await waitUp();
  const suites = [
    ["core.mjs"], // PAYE, BMI, inflation, mobile menu
    ["ia.mjs", [String(CALCULATORS)]], // navigation, hub, page structure, sitemap
    ["n2g.mjs"],
    ["cgpa.mjs"],
    ["loan.mjs"],
    ["savings.mjs"],
    ["vat.mjs"],
  ];
  const failed = [];
  for (const [script, args] of suites) {
    console.log(`\n=== ${script} ===`);
    if ((await run(script, args)) !== 0) failed.push(script);
  }
  console.log(failed.length ? `\nFAILED: ${failed.join(", ")}` : "\nAll browser suites passed.");
  process.exitCode = failed.length ? 1 : 0;
} finally {
  stop();
}
