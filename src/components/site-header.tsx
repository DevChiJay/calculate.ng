"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { CalculatorsMenu } from "@/components/calculators-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { calculatorGroups } from "@/lib/site";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const pathname = usePathname();
  // The mobile menu is "open" only for the page it was opened on, so it closes by itself after any navigation.
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === pathname;
  const setOpen = (value: boolean) => setOpenOn(value ? pathname : null);

  const linkClass = (active: boolean) =>
    cn(
      "flex min-h-11 items-center rounded-md px-4 text-base font-medium",
      active ? "bg-accent text-accent-foreground" : "text-foreground hover:bg-foreground/5",
    );

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background">
      <div className="container-x flex h-16 items-center justify-between gap-4">
        <Link href="/" aria-label="Calculate.ng home" className="flex shrink-0 items-center rounded-md">
          <Image src="/logo.svg" width={120} height={40} alt="" priority className="h-10 w-auto" />
        </Link>

        <div className="flex items-center gap-1">
          <nav aria-label="Main" className="hidden md:block">
            <CalculatorsMenu />
          </nav>
          <ThemeToggle className="hidden md:inline-flex" />

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
                <Menu aria-hidden />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[85vw] max-w-sm overflow-y-auto p-0">
              <SheetTitle className="sr-only">Menu</SheetTitle>
              <SheetDescription className="sr-only">Choose a calculator or change the colour theme.</SheetDescription>
              <nav aria-label="Mobile" className="flex min-h-full flex-col p-4 pt-14">
                {calculatorGroups.map((g) => (
                  <div key={g.id} className="mb-5">
                    <p className="px-4 text-xs font-semibold uppercase tracking-[0.12em] text-primary">{g.name}</p>
                    <ul className="mt-1">
                      {g.items.map((c) => (
                        <li key={c.path}>
                          <Link
                            href={c.path}
                            onClick={() => setOpen(false)}
                            aria-current={pathname === c.path ? "page" : undefined}
                            className={linkClass(pathname === c.path)}
                          >
                            {c.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
                <Link
                  href="/calculators"
                  onClick={() => setOpen(false)}
                  aria-current={pathname === "/calculators" ? "page" : undefined}
                  className={cn(linkClass(pathname === "/calculators"), "text-primary")}
                >
                  All calculators
                </Link>
                <ThemeToggle withLabel className="mt-auto" />
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
