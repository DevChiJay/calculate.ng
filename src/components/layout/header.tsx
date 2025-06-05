import Link from "next/link";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { Navigation } from "./navigation";
import { ModeToggle } from "./mode-toggle";
import { ThemeSelector } from "./theme-selector";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60" role="banner">
      <div className="container flex h-14 items-center pl-6 md:pl-8">
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="mr-2" aria-label="Open navigation menu">
                <Menu className="h-5 w-5" aria-hidden="true" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[240px] pr-0" aria-label="Navigation Menu">
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <Navigation />
            </SheetContent>
          </Sheet>
        </div>
        <div className="flex w-full items-center space-x-4 md:space-x-6">
          <Link href="/" className="flex items-center space-x-2" aria-label="Calculate.ng Home">
            <span className="font-bold">Calculate.ng</span>
          </Link>
        </div>        
        <div className="flex flex-1 items-center justify-end space-x-4">
          <ThemeSelector />
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}
