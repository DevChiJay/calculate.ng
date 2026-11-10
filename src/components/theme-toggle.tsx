"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { Monitor, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const order = ["dark", "light", "system"] as const;
type Mode = (typeof order)[number];
const label: Record<Mode, string> = { dark: "Dark", light: "Light", system: "System" };
const icon = { dark: Moon, light: Sun, system: Monitor };
const subscribeNoop = () => () => {};

/** Cycles Dark → Light → System. `withLabel` shows the mode as text (used in the mobile menu). */
export function ThemeToggle({ withLabel = false, className }: { withLabel?: boolean; className?: string }) {
  const { theme, setTheme } = useTheme();
  // false on the server and during hydration, true afterwards (the stored theme is only known client-side).
  const mounted = useSyncExternalStore(subscribeNoop, () => true, () => false);

  // Before mount the stored theme is unknown on the server; render a same-size placeholder.
  const current: Mode = mounted && order.includes(theme as Mode) ? (theme as Mode) : "dark";
  const next = order[(order.indexOf(current) + 1) % order.length];
  const Icon = icon[current];

  return (
    <Button
      type="button"
      variant="ghost"
      size={withLabel ? "default" : "icon"}
      className={cn(withLabel && "w-full justify-start gap-3 text-base", className)}
      aria-label={`Theme: ${label[current]}. Switch to ${label[next]}`}
      onClick={() => setTheme(next)}
    >
      {mounted ? <Icon aria-hidden /> : <span className="size-4" aria-hidden />}
      {withLabel && <span>Theme: {label[current]}</span>}
    </Button>
  );
}
