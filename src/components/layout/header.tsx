import Link from "next/link";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { Navigation } from "./navigation";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="mr-2">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[240px] pr-0">
              <Navigation />
            </SheetContent>
          </Sheet>
        </div>
        <div className="flex w-full items-center space-x-4 md:space-x-6">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold">Calculate.ng</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
