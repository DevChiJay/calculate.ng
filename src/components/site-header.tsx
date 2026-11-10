"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/theme-toggle";
import { calculators } from "@/lib/site";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const pathname = usePathname();
  // The menu is "open" only for the page it was opened on, so it closes by itself after any navigation.
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === pathname;
  const setOpen = (value: boolean) => setOpenOn(value ? pathname : null);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background">
      <div className="container-x flex h-16 items-center justify-between gap-4">
        <Link href="/" aria-label="Calculate.ng home" className="flex shrink-0 items-center rounded-md">
          <Image src="/logo.svg" width={120} height={40} alt="" priority className="h-10 w-auto" />
        </Link>

        <nav aria-label="Main" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {calculators.map((c) => {
              const active = pathname === c.path;
              return (
                <li key={c.path}>
                  <Link
                    href={c.path}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex h-11 items-center rounded-md px-4 text-sm font-medium transition-colors",
                      active ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {c.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-1">
          <ThemeToggle className="hidden md:inline-flex" />
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
                <Menu aria-hidden />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[85vw] max-w-sm p-0">
              <SheetTitle className="sr-only">Menu</SheetTitle>
              <SheetDescription className="sr-only">Choose a calculator or change the colour theme.</SheetDescription>
              <nav aria-label="Mobile" className="flex h-full flex-col p-4 pt-14">
                <ul className="space-y-1">
                  {calculators.map((c) => {
                    const active = pathname === c.path;
                    return (
                      <li key={c.path}>
                        <Link
                          href={c.path}
                          onClick={() => setOpen(false)}
                          aria-current={active ? "page" : undefined}
                          className={cn(
                            "flex min-h-12 items-center rounded-md px-4 text-lg font-medium",
                            active ? "bg-accent text-accent-foreground" : "text-foreground hover:bg-foreground/5",
                          )}
                        >
                          {c.name}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
                <ThemeToggle withLabel className="mt-auto" />
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
