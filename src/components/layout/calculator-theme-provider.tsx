"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { ThemeStorage } from "@/lib/theme-storage";

export type CalculatorTheme = "bmi" | "tax" | "inflation" | "default";

interface CalculatorThemeContextType {
  calculatorTheme: CalculatorTheme;
  setCalculatorTheme: (theme: CalculatorTheme) => void;
}

const CalculatorThemeContext = createContext<CalculatorThemeContextType | undefined>(undefined);

export function CalculatorThemeProvider({ children }: { children: React.ReactNode }) {
  const [calculatorTheme, setCalculatorThemeState] = useState<CalculatorTheme>("default");
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize theme from localStorage on client side
  useEffect(() => {
    const savedTheme = ThemeStorage.getCalculatorTheme();
    if (savedTheme && ["bmi", "tax", "inflation", "default"].includes(savedTheme)) {
      setCalculatorThemeState(savedTheme as CalculatorTheme);
    }
    setIsInitialized(true);
  }, []);

  const setCalculatorTheme = (theme: CalculatorTheme) => {
    setCalculatorThemeState(theme);
    ThemeStorage.saveCalculatorTheme(theme);
  };

  useEffect(() => {
    if (!isInitialized) return;

    // Apply theme class to body
    const body = document.body;
    body.classList.remove("bmi-theme", "tax-theme", "inflation-theme");
    
    if (calculatorTheme !== "default") {
      body.classList.add(`${calculatorTheme}-theme`);
    }
    
    return () => {
      body.classList.remove("bmi-theme", "tax-theme", "inflation-theme");
    };
  }, [calculatorTheme, isInitialized]);

  return (
    <CalculatorThemeContext.Provider value={{ calculatorTheme, setCalculatorTheme }}>
      {children}
    </CalculatorThemeContext.Provider>
  );
}

export function useCalculatorTheme() {
  const context = useContext(CalculatorThemeContext);
  if (context === undefined) {
    throw new Error("useCalculatorTheme must be used within a CalculatorThemeProvider");
  }
  return context;
}
