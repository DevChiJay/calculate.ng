// Theme configuration for calculator-specific color schemes
export const themeConfig = {
  bmi: {
    name: "Ocean",
    description: "Cool blues and greens for health and wellness",
    colors: {
      primary: "oklch(0.55 0.25 220)",
      secondary: "oklch(0.65 0.20 160)",
      accent: "oklch(0.75 0.15 180)",
      gradient: "linear-gradient(135deg, oklch(0.98 0.02 220) 0%, oklch(0.75 0.15 180) 100%)",
    },
    icon: "🌊",
  },
  tax: {
    name: "Royal",
    description: "Professional purples and golds for financial matters",
    colors: {
      primary: "oklch(0.50 0.25 280)",
      secondary: "oklch(0.75 0.15 45)",
      accent: "oklch(0.85 0.10 45)",
      gradient: "linear-gradient(135deg, oklch(0.98 0.02 280) 0%, oklch(0.85 0.10 45) 100%)",
    },
    icon: "👑",
  },
  inflation: {
    name: "Sunset",
    description: "Warm oranges and reds for economic indicators",
    colors: {
      primary: "oklch(0.60 0.25 35)",
      secondary: "oklch(0.70 0.20 15)",
      accent: "oklch(0.80 0.15 25)",
      gradient: "linear-gradient(135deg, oklch(0.98 0.02 35) 0%, oklch(0.80 0.15 25) 100%)",
    },
    icon: "🌅",
  },
  default: {
    name: "Default",
    description: "Clean and neutral theme",
    colors: {
      primary: "oklch(0.205 0 0)",
      secondary: "oklch(0.97 0 0)",
      accent: "oklch(0.97 0 0)",
      gradient: "linear-gradient(135deg, oklch(1 0 0) 0%, oklch(0.97 0 0) 100%)",
    },
    icon: "⚪",
  },
} as const;

export type ThemeKey = keyof typeof themeConfig;
