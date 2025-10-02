"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Activity, TrendingUp, Landmark, Percent, PiggyBank, Calculator as CalcIcon } from "lucide-react";

const baseNavigationItems = [
	{
		title: "BMI Calculator",
		href: "/bmi-calculator",
		icon: <Activity className="h-5 w-5 mr-2" aria-hidden="true" />,
		emoji: "🌊",
	},
	{
		title: "Inflation Calculator",
		href: "/inflation-calculator",
		icon: <TrendingUp className="h-5 w-5 mr-2" aria-hidden="true" />,
		emoji: "🌅",
	},
	{
		title: "Income Tax Calculator",
		href: "/tax-calculator",
		icon: <Landmark className="h-5 w-5 mr-2" aria-hidden="true" />,
		emoji: "👑",
	},
];

// Experimental calculators (feature-flagged)
const experimentalNavigationItems = [
  {
    title: "VAT Calculator",
    href: "/vat-calculator",
    icon: <Percent className="h-5 w-5 mr-2" aria-hidden="true" />,
    emoji: "🧾",
  },
  {
    title: "Pension Calculator",
    href: "/pension-calculator",
    icon: <PiggyBank className="h-5 w-5 mr-2" aria-hidden="true" />,
    emoji: "💼",
  },
  {
    title: "Loan Amortization",
    href: "/loan-amortization-calculator",
    icon: <CalcIcon className="h-5 w-5 mr-2" aria-hidden="true" />,
    emoji: "�",
  },
];

const navigationItems = (() => {
  if (process.env.NEXT_PUBLIC_EXPERIMENTAL_CALCS === 'true') {
    return [...baseNavigationItems, ...experimentalNavigationItems];
  }
  return baseNavigationItems;
})();

export function Navigation() {
	const pathname = usePathname();

	return (
		<nav className="flex flex-col space-y-1" aria-label="Main Navigation">
			{navigationItems.map((item) => (
				<Link
					key={item.href}
					href={item.href}
					className={cn(
						"flex items-center px-3 py-2 text-sm transition-colors rounded-md hover:text-primary hover:bg-accent",
						pathname === item.href
							? "text-foreground font-semibold bg-accent"
							: "text-muted-foreground font-medium"
					)}
					aria-current={pathname === item.href ? "page" : undefined}
				>
					{item.icon}
					<span>{item.title}</span>
					<span
						className="ml-auto text-lg"
						suppressHydrationWarning
						aria-hidden="true"
					>
						{item.emoji}
					</span>
				</Link>
			))}
		</nav>
	);
}
