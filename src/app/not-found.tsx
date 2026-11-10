import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { calculators } from "@/lib/site";

export const metadata: Metadata = { title: "Page not found", robots: { index: false } };

export default function NotFound() {
  return (
    <div className="container-x py-20">
      <p className="text-sm font-semibold uppercase tracking-[0.12em] text-primary">404</p>
      <h1 className="mt-3 text-4xl font-semibold">We can’t find that page</h1>
      <p className="mt-4 max-w-xl text-lg text-muted-foreground">
        The link may be old or mistyped. Try one of the calculators instead.
      </p>
      <ul className="mt-8 flex flex-wrap gap-3">
        {calculators.map((c) => (
          <li key={c.path}>
            <Button asChild variant="outline">
              <Link href={c.path}>{c.name}</Link>
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
