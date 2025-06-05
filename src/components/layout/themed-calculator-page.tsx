"use client";

import { useEffect } from "react";
import { useCalculatorTheme, type CalculatorTheme } from "@/components/layout/calculator-theme-provider";

interface ThemedCalculatorPageProps {
  children: React.ReactNode;
  theme: CalculatorTheme;
  title: string;
  description: string;
}

export function ThemedCalculatorPage({ 
  children, 
  theme, 
  title, 
  description 
}: ThemedCalculatorPageProps) {
  const { setCalculatorTheme } = useCalculatorTheme();

  useEffect(() => {
    setCalculatorTheme(theme);
    
    return () => {
      setCalculatorTheme("default");
    };
  }, [theme, setCalculatorTheme]);

  const getGradientClass = () => {
    switch (theme) {
      case "bmi":
        return "bmi-gradient";
      case "tax":
        return "tax-gradient";
      case "inflation":
        return "inflation-gradient";
      default:
        return "";
    }
  };

  return (
    <div className={`min-h-screen transition-all duration-500 ${getGradientClass()}`}>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {title}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {description}
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <div className="calculator-card rounded-xl p-6 md:p-8 backdrop-blur-sm border border-primary/20 shadow-xl">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
