"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, ChevronDown } from "lucide-react";
import { calculatorGroups, calculators } from "@/lib/site";
import { cn } from "@/lib/utils";

/**
 * Desktop "Calculators" menu: a disclosure (not an ARIA menu), so it is just a button that reveals a
 * panel of ordinary links. Escape, an outside click, tabbing away, or navigating closes it.
 */
export function CalculatorsMenu() {
  const pathname = usePathname();
  // Open only for the page it was opened on, so it closes by itself after any navigation.
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === pathname;
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const active = calculators.some((c) => c.path === pathname) || pathname === "/calculators";

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpenOn(null);
        buttonRef.current?.focus();
      }
    };
    const onPointer = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpenOn(null);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  return (
    <div
      ref={rootRef}
      onBlur={(e) => {
        // Close when keyboard focus moves somewhere outside the menu.
        if (e.relatedTarget && !rootRef.current?.contains(e.relatedTarget as Node)) setOpenOn(null);
      }}
    >
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls="calculators-panel"
        onClick={() => setOpenOn(open ? null : pathname)}
        className={cn(
          "flex h-11 items-center gap-1.5 rounded-md px-4 text-sm font-medium transition-colors",
          open || active ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground",
        )}
      >
        Calculators
        <ChevronDown aria-hidden className={cn("size-4 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div id="calculators-panel" className="absolute inset-x-0 top-full border-b border-border bg-background shadow-lg">
          <div className="container-x grid gap-8 py-8 md:grid-cols-3">
            {calculatorGroups.map((g) => (
              <div key={g.id}>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">{g.name}</p>
                <ul className="mt-3 space-y-1">
                  {g.items.map((c) => (
                    <li key={c.path}>
                      <Link
                        href={c.path}
                        aria-current={pathname === c.path ? "page" : undefined}
                        className={cn(
                          "block rounded-md px-3 py-2.5 hover:bg-foreground/5",
                          pathname === c.path && "bg-accent text-accent-foreground",
                        )}
                      >
                        <span className="block font-medium">{c.name}</span>
                        <span className={cn("mt-0.5 block text-sm", pathname === c.path ? "" : "text-muted-foreground")}>
                          {c.blurb}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-border">
            <div className="container-x py-2">
              <Link
                href="/calculators"
                className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-primary underline-offset-4 hover:underline"
              >
                All calculators <ArrowRight aria-hidden className="size-4" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
