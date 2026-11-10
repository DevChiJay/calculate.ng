import { chromium } from "playwright";

/**
 * Launches the browser for the e2e suites. By default it drives the Google Chrome installed on the machine, so no
 * browser has to be downloaded (and Playwright's downloader is never used). Override with E2E_CHANNEL, for example
 * E2E_CHANNEL=msedge, or set E2E_CHANNEL= (empty) to use Playwright's own Chromium after `npx playwright install chromium`.
 */
export function launch() {
  const channel = process.env.E2E_CHANNEL === undefined ? "chrome" : process.env.E2E_CHANNEL || undefined;
  return chromium.launch({ channel });
}
