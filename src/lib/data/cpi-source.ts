/**
 * CPI Data Access Layer
 * Provides abstraction for fetching CPI data with fallback to static dataset.
 * Future: replace stub fetch with real API integration.
 */

import { NIGERIA_CPI_DATA, type CPIDataPoint, getLatestCPI as getStaticLatestCPI } from '@/lib/data/nigeria-cpi';

export interface CPIDataSourceResult {
  data: CPIDataPoint[];
  source: 'remote' | 'static';
  fetchedAt: number;
  error?: string;
}

let cached: CPIDataSourceResult | null = null;
let inFlight: Promise<CPIDataSourceResult> | null = null;
const STALE_MS = 1000 * 60 * 60; // 1 hour

// Simulated remote endpoint stub
async function fetchRemoteCPI(): Promise<CPIDataPoint[]> {
  // Placeholder: simulate network latency & occasional failure
  await new Promise(r => setTimeout(r, 120));
  const shouldFail = false; // Flip to true to test fallback
  if (shouldFail) throw new Error('Remote CPI endpoint unavailable');
  // For now return static data slice to emulate remote freshness
  return [...NIGERIA_CPI_DATA];
}

async function loadCPIData(forceRefresh = false): Promise<CPIDataSourceResult> {
  if (!forceRefresh && cached && (Date.now() - cached.fetchedAt) < STALE_MS) {
    return cached;
  }
  if (inFlight) return inFlight;

  inFlight = (async () => {
    try {
      const remote = await fetchRemoteCPI();
      cached = { data: remote, source: 'remote', fetchedAt: Date.now() };
    } catch (e) {
      cached = {
        data: [...NIGERIA_CPI_DATA],
        source: 'static',
        fetchedAt: Date.now(),
        error: e instanceof Error ? e.message : 'Unknown CPI fetch error'
      };
    } finally {
      inFlight = null;
    }
    return cached!;
  })();

  return inFlight;
}

export async function getCPIData(options: { forceRefresh?: boolean } = {}) {
  return loadCPIData(!!options.forceRefresh);
}

export async function listYears(): Promise<number[]> {
  const { data } = await getCPIData();
  return Array.from(new Set(data.map(d => d.year))).sort((a, b) => a - b);
}

export async function getLatestCPI() {
  const { data } = await getCPIData();
  // If data empty fallback to static helper
  if (!data.length) return getStaticLatestCPI();
  return data.reduce((latest, current) => {
    const latestDate = new Date(latest.year, latest.month - 1);
    const currentDate = new Date(current.year, current.month - 1);
    return currentDate > latestDate ? current : latest;
  });
}

export async function findCPIByDate(dateString: string): Promise<CPIDataPoint | undefined> {
  const { data } = await getCPIData();
  const target = new Date(dateString);
  const year = target.getFullYear();
  const month = target.getMonth() + 1;
  return data.find(d => d.year === year && d.month === month);
}

export function clearCPICache() { cached = null; }
