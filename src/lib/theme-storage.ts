/**
 * Theme persistence service for storing user theme preferences
 */

const THEME_STORAGE_KEY = "calculator-theme-preference";
const SYSTEM_THEME_STORAGE_KEY = "system-theme-preference";

export class ThemeStorage {
  /**
   * Save calculator theme preference to localStorage
   */
  static saveCalculatorTheme(theme: string): void {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(THEME_STORAGE_KEY, theme);
      } catch (error) {
        console.warn("Failed to save calculator theme to localStorage:", error);
      }
    }
  }

  /**
   * Get saved calculator theme preference from localStorage
   */
  static getCalculatorTheme(): string | null {
    if (typeof window !== "undefined") {
      try {
        return localStorage.getItem(THEME_STORAGE_KEY);
      } catch (error) {
        console.warn("Failed to read calculator theme from localStorage:", error);
        return null;
      }
    }
    return null;
  }

  /**
   * Save system theme preference (light/dark/system) to localStorage
   */
  static saveSystemTheme(theme: string): void {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(SYSTEM_THEME_STORAGE_KEY, theme);
      } catch (error) {
        console.warn("Failed to save system theme to localStorage:", error);
      }
    }
  }

  /**
   * Get saved system theme preference from localStorage
   */
  static getSystemTheme(): string | null {
    if (typeof window !== "undefined") {
      try {
        return localStorage.getItem(SYSTEM_THEME_STORAGE_KEY);
      } catch (error) {
        console.warn("Failed to read system theme from localStorage:", error);
        return null;
      }
    }
    return null;
  }

  /**
   * Clear all theme preferences
   */
  static clearThemePreferences(): void {
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(THEME_STORAGE_KEY);
        localStorage.removeItem(SYSTEM_THEME_STORAGE_KEY);
      } catch (error) {
        console.warn("Failed to clear theme preferences from localStorage:", error);
      }
    }
  }

  /**
   * Check if localStorage is available
   */
  static isStorageAvailable(): boolean {
    if (typeof window === "undefined") return false;
    
    try {
      const testKey = "__theme_storage_test__";
      localStorage.setItem(testKey, "test");
      localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }
}
