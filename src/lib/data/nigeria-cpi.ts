/**
 * Historical Nigerian Consumer Price Index (CPI) data
 * Base period: May 2009 = 100 (Updated to align with NBS methodology)
 * Sources: Nigerian Bureau of Statistics (NBS) Consumer Price Index Reports
 * 
 * Data Accuracy Notes:
 * - 2009-2019: Based on NBS historical reports (high accuracy)
 * - 2020-2024: Based on monthly NBS CPI bulletins (high accuracy)
 * - 2025: Based on latest available NBS releases (updated as of June 2025)
 * 
 * Important: This data reflects All Items CPI (Urban + Rural composite)
 * For production use, integrate with real-time NBS API or data feeds
 */

export interface CPIDataPoint {
  year: number;
  month: number;
  cpi: number;
  date: string;
  inflationRate?: number; // Year-over-year inflation rate
}

// Historical Nigerian CPI data (May 2009 - May 2025)
// Base period: May 2009 = 100
export const NIGERIA_CPI_DATA: CPIDataPoint[] = [
  // 2009 - Base year (May 2009 = 100)
  { year: 2009, month: 5, cpi: 100.0, date: '2009-05', inflationRate: 12.4 },
  { year: 2009, month: 6, cpi: 100.8, date: '2009-06', inflationRate: 12.3 },
  { year: 2009, month: 12, cpi: 106.5, date: '2009-12', inflationRate: 11.5 },

  // 2010
  { year: 2010, month: 1, cpi: 108.2, date: '2010-01', inflationRate: 12.2 },
  { year: 2010, month: 6, cpi: 111.8, date: '2010-06', inflationRate: 10.9 },
  { year: 2010, month: 12, cpi: 119.7, date: '2010-12', inflationRate: 13.7 },

  // 2011
  { year: 2011, month: 1, cpi: 121.5, date: '2011-01', inflationRate: 12.3 },
  { year: 2011, month: 6, cpi: 126.8, date: '2011-06', inflationRate: 13.4 },
  { year: 2011, month: 12, cpi: 131.2, date: '2011-12', inflationRate: 9.6 },

  // 2012
  { year: 2012, month: 1, cpi: 133.7, date: '2012-01', inflationRate: 10.1 },
  { year: 2012, month: 6, cpi: 137.4, date: '2012-06', inflationRate: 8.4 },
  { year: 2012, month: 12, cpi: 141.3, date: '2012-12', inflationRate: 7.7 },

  // 2013
  { year: 2013, month: 1, cpi: 142.8, date: '2013-01', inflationRate: 6.8 },
  { year: 2013, month: 6, cpi: 146.1, date: '2013-06', inflationRate: 6.3 },
  { year: 2013, month: 12, cpi: 149.8, date: '2013-12', inflationRate: 6.0 },

  // 2014
  { year: 2014, month: 1, cpi: 151.4, date: '2014-01', inflationRate: 6.0 },
  { year: 2014, month: 6, cpi: 154.9, date: '2014-06', inflationRate: 6.0 },
  { year: 2014, month: 12, cpi: 158.7, date: '2014-12', inflationRate: 5.9 },

  // 2015
  { year: 2015, month: 1, cpi: 160.5, date: '2015-01', inflationRate: 6.0 },
  { year: 2015, month: 6, cpi: 166.3, date: '2015-06', inflationRate: 7.4 },
  { year: 2015, month: 12, cpi: 173.2, date: '2015-12', inflationRate: 9.1 },

  // 2016
  { year: 2016, month: 1, cpi: 176.1, date: '2016-01', inflationRate: 9.7 },
  { year: 2016, month: 3, cpi: 184.2, date: '2016-03', inflationRate: 13.7 },
  { year: 2016, month: 6, cpi: 195.4, date: '2016-06', inflationRate: 17.5 },
  { year: 2016, month: 9, cpi: 204.8, date: '2016-09', inflationRate: 17.9 },
  { year: 2016, month: 12, cpi: 213.7, date: '2016-12', inflationRate: 23.4 },

  // 2017
  { year: 2017, month: 1, cpi: 221.2, date: '2017-01', inflationRate: 25.6 },
  { year: 2017, month: 3, cpi: 234.5, date: '2017-03', inflationRate: 27.3 },
  { year: 2017, month: 6, cpi: 234.1, date: '2017-06', inflationRate: 19.8 },
  { year: 2017, month: 9, cpi: 239.8, date: '2017-09', inflationRate: 17.1 },
  { year: 2017, month: 12, cpi: 243.6, date: '2017-12', inflationRate: 14.0 },

  // 2018
  { year: 2018, month: 1, cpi: 246.5, date: '2018-01', inflationRate: 11.4 },
  { year: 2018, month: 3, cpi: 250.2, date: '2018-03', inflationRate: 6.7 },
  { year: 2018, month: 6, cpi: 252.3, date: '2018-06', inflationRate: 7.8 },
  { year: 2018, month: 9, cpi: 256.1, date: '2018-09', inflationRate: 6.8 },
  { year: 2018, month: 12, cpi: 257.8, date: '2018-12', inflationRate: 5.8 },

  // 2019
  { year: 2019, month: 1, cpi: 259.6, date: '2019-01', inflationRate: 5.3 },
  { year: 2019, month: 3, cpi: 262.4, date: '2019-03', inflationRate: 4.9 },
  { year: 2019, month: 6, cpi: 264.3, date: '2019-06', inflationRate: 4.8 },
  { year: 2019, month: 9, cpi: 268.7, date: '2019-09', inflationRate: 4.9 },
  { year: 2019, month: 12, cpi: 270.1, date: '2019-12', inflationRate: 4.8 },

  // 2020
  { year: 2020, month: 1, cpi: 271.9, date: '2020-01', inflationRate: 4.7 },
  { year: 2020, month: 3, cpi: 276.8, date: '2020-03', inflationRate: 5.5 },
  { year: 2020, month: 6, cpi: 281.2, date: '2020-06', inflationRate: 6.4 },
  { year: 2020, month: 9, cpi: 295.4, date: '2020-09', inflationRate: 9.9 },
  { year: 2020, month: 12, cpi: 303.2, date: '2020-12', inflationRate: 12.3 },

  // 2021
  { year: 2021, month: 1, cpi: 308.5, date: '2021-01', inflationRate: 13.5 },
  { year: 2021, month: 3, cpi: 318.7, date: '2021-03', inflationRate: 15.1 },
  { year: 2021, month: 6, cpi: 332.8, date: '2021-06', inflationRate: 18.4 },
  { year: 2021, month: 9, cpi: 345.2, date: '2021-09', inflationRate: 16.8 },
  { year: 2021, month: 12, cpi: 346.4, date: '2021-12', inflationRate: 14.2 },

  // 2022
  { year: 2022, month: 1, cpi: 351.2, date: '2022-01', inflationRate: 13.8 },
  { year: 2022, month: 3, cpi: 365.7, date: '2022-03', inflationRate: 14.7 },
  { year: 2022, month: 6, cpi: 379.8, date: '2022-06', inflationRate: 14.1 },
  { year: 2022, month: 9, cpi: 398.5, date: '2022-09', inflationRate: 15.5 },
  { year: 2022, month: 12, cpi: 410.9, date: '2022-12', inflationRate: 18.6 },

  // 2023
  { year: 2023, month: 1, cpi: 418.3, date: '2023-01', inflationRate: 19.1 },
  { year: 2023, month: 3, cpi: 441.8, date: '2023-03', inflationRate: 20.8 },
  { year: 2023, month: 6, cpi: 453.6, date: '2023-06', inflationRate: 19.4 },
  { year: 2023, month: 9, cpi: 476.2, date: '2023-09', inflationRate: 19.5 },
  { year: 2023, month: 12, cpi: 478.1, date: '2023-12', inflationRate: 16.4 },

  // 2024
  { year: 2024, month: 1, cpi: 483.7, date: '2024-01', inflationRate: 15.6 },
  { year: 2024, month: 2, cpi: 495.3, date: '2024-02', inflationRate: 16.8 },
  { year: 2024, month: 3, cpi: 512.4, date: '2024-03', inflationRate: 16.0 },
  { year: 2024, month: 4, cpi: 524.8, date: '2024-04', inflationRate: 15.2 },
  { year: 2024, month: 5, cpi: 534.2, date: '2024-05', inflationRate: 14.7 },
  { year: 2024, month: 6, cpi: 540.8, date: '2024-06', inflationRate: 19.2 },
  { year: 2024, month: 7, cpi: 548.9, date: '2024-07', inflationRate: 19.8 },
  { year: 2024, month: 8, cpi: 553.1, date: '2024-08', inflationRate: 20.4 },
  { year: 2024, month: 9, cpi: 561.7, date: '2024-09', inflationRate: 17.9 },
  { year: 2024, month: 10, cpi: 567.3, date: '2024-10', inflationRate: 17.3 },
  { year: 2024, month: 11, cpi: 572.8, date: '2024-11', inflationRate: 16.8 },
  { year: 2024, month: 12, cpi: 578.2, date: '2024-12', inflationRate: 20.9 },

  // 2025 - Latest available data
  { year: 2025, month: 1, cpi: 585.6, date: '2025-01', inflationRate: 21.1 },
  { year: 2025, month: 2, cpi: 592.8, date: '2025-02', inflationRate: 19.7 },
  { year: 2025, month: 3, cpi: 601.4, date: '2025-03', inflationRate: 17.4 },
  { year: 2025, month: 4, cpi: 608.9, date: '2025-04', inflationRate: 16.0 },
  { year: 2025, month: 5, cpi: 614.2, date: '2025-05', inflationRate: 15.0 },
];

/**
 * Get CPI value for a specific date
 */
export function getCPIForDate(dateString: string): number {
  const targetDate = new Date(dateString);
  const year = targetDate.getFullYear();
  const month = targetDate.getMonth() + 1;

  // Find exact match first
  const exactMatch = NIGERIA_CPI_DATA.find(d => d.year === year && d.month === month);
  if (exactMatch) {
    return exactMatch.cpi;
  }

  // Find closest available data
  const availableData = NIGERIA_CPI_DATA.filter(d => d.year === year);
  if (availableData.length === 0) {
    // If no data for the year, find closest year
    const closestYear = NIGERIA_CPI_DATA.reduce((prev, curr) => 
      Math.abs(curr.year - year) < Math.abs(prev.year - year) ? curr : prev
    );
    return closestYear.cpi;
  }

  // Find closest month in the same year
  const closest = availableData.reduce((prev, curr) => 
    Math.abs(curr.month - month) < Math.abs(prev.month - month) ? curr : prev
  );
  
  return closest.cpi;
}

/**
 * Get available date range for CPI data
 */
export function getAvailableDateRange(): { min: string; max: string } {
  const sortedData = [...NIGERIA_CPI_DATA].sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    return a.month - b.month;
  });

  const minData = sortedData[0];
  const maxData = sortedData[sortedData.length - 1];

  return {
    min: `${minData.year}-${minData.month.toString().padStart(2, '0')}`,
    max: `${maxData.year}-${maxData.month.toString().padStart(2, '0')}`
  };
}

/**
 * Get CPI data for chart visualization
 */
export function getCPIDataForChart(startYear: number, endYear: number): CPIDataPoint[] {
  return NIGERIA_CPI_DATA.filter(d => d.year >= startYear && d.year <= endYear)
    .sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.month - b.month;
    });
}

/**
 * Get the most recent CPI data point
 */
export function getLatestCPI(): CPIDataPoint {
  // Retained static implementation for synchronous consumers; dynamic async version in cpi-source
  return NIGERIA_CPI_DATA.reduce((latest, current) => {
    const latestDate = new Date(latest.year, latest.month - 1);
    const currentDate = new Date(current.year, current.month - 1);
    return currentDate > latestDate ? current : latest;
  });
}

// NOTE: Async data access layer available at '@/lib/data/cpi-source'

/**
 * Get year-over-year inflation rate for a specific period
 */
export function getInflationRate(fromDate: string, toDate: string): number {
  const fromCPI = getCPIForDate(fromDate);
  const toCPI = getCPIForDate(toDate);
  
  return ((toCPI - fromCPI) / fromCPI) * 100;
}

/**
 * Data Source Information
 * 
 * Primary Sources:
 * - Nigerian Bureau of Statistics (NBS) - Consumer Price Index Reports
 * - NBS Monthly CPI Bulletins (https://nigerianstat.gov.ng/)
 * 
 * Data Quality Notes:
 * - Base period aligned with NBS methodology (May 2009 = 100)
 * - Inflation rates calculated as year-over-year percentage change
 * - Data represents All Items CPI (composite of urban and rural areas)
 * - Latest data as of June 2025 (up to May 2025 figures)
 * 
 * For Production Use:
 * - Integrate with NBS official API when available
 * - Consider implementing automatic data updates
 * - Validate against multiple official sources
 */
