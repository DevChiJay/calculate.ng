"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { themeConfig } from "@/lib/theme-config";
import { useCalculatorTheme } from "./calculator-theme-provider";

export function ThemeShowcase() {
  const { calculatorTheme } = useCalculatorTheme();
  const currentTheme = themeConfig[calculatorTheme];

  return (
    <Card className="calculator-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">{currentTheme.icon}</span>
          {currentTheme.name} Theme
        </CardTitle>
        <CardDescription>{currentTheme.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button>Primary Button</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
        </div>
        
        <div className="grid grid-cols-3 gap-2">
          <div 
            className="h-12 rounded flex items-center justify-center text-white text-sm font-medium"
            style={{ background: currentTheme.colors.primary }}
          >
            Primary
          </div>
          <div 
            className="h-12 rounded flex items-center justify-center text-white text-sm font-medium"
            style={{ background: currentTheme.colors.secondary }}
          >
            Secondary
          </div>
          <div 
            className="h-12 rounded flex items-center justify-center text-white text-sm font-medium"
            style={{ background: currentTheme.colors.accent }}
          >
            Accent
          </div>
        </div>
        
        <div 
          className="h-16 rounded-lg flex items-center justify-center text-white font-medium"
          style={{ background: currentTheme.colors.gradient }}
        >
          Gradient Background
        </div>
      </CardContent>
    </Card>
  );
}
