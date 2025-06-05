"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Activity, TrendingUp, Landmark } from "lucide-react";

const navigationItems = [
	{
		title: "BMI Calculator",
		href: "/bmi-calculator",
		icon: <Activity className="h-5 w-5 mr-2" />,
		emoji: "🌊",
	},
	{
		title: "Inflation Calculator",
		href: "/inflation-calculator",
		icon: <TrendingUp className="h-5 w-5 mr-2" />,
		emoji: "🌅",
	},
	{
		title: "Income Tax Calculator",
		href: "/tax-calculator",
		icon: <Landmark className="h-5 w-5 mr-2" />,
		emoji: "👑",
	},
];

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
