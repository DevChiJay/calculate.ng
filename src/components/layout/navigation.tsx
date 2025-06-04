"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navigationItems = [
  {
    title: "BMI Calculator",
    href: "/bmi-calculator",
  },
  {
    title: "Inflation Calculator",
    href: "/inflation-calculator",
  },
  {
    title: "Income Tax Calculator",
    href: "/tax-calculator",
  },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col space-y-1">
      {navigationItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "flex items-center px-3 py-2 text-sm transition-colors rounded-md hover:text-primary hover:bg-accent",
            pathname === item.href
              ? "text-foreground font-medium bg-accent"
              : "text-muted-foreground"
          )}
        >
          {item.title}
        </Link>
      ))}
    </nav>
  );
}
