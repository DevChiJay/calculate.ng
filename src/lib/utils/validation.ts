/**
 * Input Validation Utility Functions
 * This module provides utilities for validating and sanitizing inputs across calculators
 */

/**
 * Validates numeric input to ensure it's within acceptable range
 * @param value The input value to validate
 * @param min Optional minimum allowed value
 * @param max Optional maximum allowed value
 * @returns Whether the input is valid
 */
export function validateNumericInput(value: string | number, min?: number, max?: number): boolean {
  // Convert to number for validation
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  // Check if it's a valid number
  if (isNaN(numValue)) return false;
  
  // Check range if specified
  if (min !== undefined && numValue < min) return false;
  if (max !== undefined && numValue > max) return false;
  
  return true;
}

/**
 * Sanitizes numeric input to ensure it's within range and is a valid number
 * @param value The input value to sanitize
 * @param min Optional minimum allowed value
 * @param max Optional maximum allowed value
 * @param defaultValue Default value to return if input is invalid
 * @returns Sanitized number
 */
export function sanitizeNumericInput(
  value: string | number, 
  min?: number, 
  max?: number, 
  defaultValue = 0
): number {
  // Convert to number
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  // If invalid, return default
  if (isNaN(numValue)) return defaultValue;
  
  // Apply min/max constraints
  if (min !== undefined && numValue < min) return min;
  if (max !== undefined && numValue > max) return max;
  
  return numValue;
}

/**
 * Formats currency values to Nigerian Naira
 * @param value The value to format
 * @returns Formatted currency string
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 2,
  }).format(value);
}

/**
 * Formats percentage values
 * @param value The decimal value (e.g., 0.15 for 15%)
 * @param decimals Number of decimal places
 * @returns Formatted percentage string
 */
export function formatPercentage(value: number, decimals = 2): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Debounces a function call
 * @param func The function to debounce
 * @param wait Wait time in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T, 
  wait = 300
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return function(...args: Parameters<T>): void {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
