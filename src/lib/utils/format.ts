/**
 * Shared formatting utilities for currency and percentage values.
 * Centralizing these helpers avoids duplication across calculation modules.
 */

/**
 * Format a number as Nigerian Naira currency.
 * @param amount The numeric amount.
 * @param decimals Number of decimal places (default 2). Use 0 for whole-naira display.
 */
export function formatNGN(amount: number, decimals: number = 2): string {
  if (!Number.isFinite(amount)) return '₦0';
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(amount);
}

/**
 * Format a number as a percentage string.
 * @param value Raw numeric value representing the percentage (e.g. 12.34 means 12.34%).
 * @param decimals Number of decimal places (default 2).
 */
export function formatPercentage(value: number, decimals: number = 2): string {
  if (!Number.isFinite(value)) return '0%';
  return `${value.toFixed(decimals)}%`;
}
