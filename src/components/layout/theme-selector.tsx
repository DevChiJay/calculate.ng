"use client";

import * as React from "react";
import { Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCalculatorTheme, type CalculatorTheme } from "./calculator-theme-provider";
import { themeConfig } from "@/lib/theme-config";

export function ThemeSelector() {
  const [mounted, setMounted] = React.useState(false);
  const { calculatorTheme, setCalculatorTheme } = useCalculatorTheme();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent rendering until mounted to avoid hydration issues
  if (!mounted) {
    return (
      <Button variant="outline" size="sm" className="gap-2">
        <Palette className="h-4 w-4" />
        <span className="hidden sm:inline">Default</span>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Palette className="h-4 w-4" />
          <span className="hidden sm:inline">
            {themeConfig[calculatorTheme].name}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {Object.entries(themeConfig).map(([key, config]) => (
          <DropdownMenuItem
            key={key}
            onClick={() => setCalculatorTheme(key as CalculatorTheme)}
            className="flex items-center gap-3 p-3"
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">{config.icon}</span>
              <div className="flex flex-col">
                <span className="font-medium">{config.name}</span>
                <span className="text-xs text-muted-foreground">
                  {config.description}
                </span>
              </div>
            </div>
            {calculatorTheme === key && (
              <span className="ml-auto text-xs">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
