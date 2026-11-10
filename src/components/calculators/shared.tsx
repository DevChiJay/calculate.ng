"use client";

import { cn } from "@/lib/utils";

/**
 * Layout pieces shared by every calculator, so they all look and behave the same:
 * inputs on the left in a card, the result on the right (stacked on phones).
 */
export function CalculatorGrid({ children, wide = false }: { children: React.ReactNode; wide?: boolean }) {
  return (
    <div
      className={cn(
        "grid gap-6",
        wide ? "lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]" : "lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]",
      )}
    >
      {children}
    </div>
  );
}

/** The inputs card. A real <form> so assistive technology announces it; submitting does nothing. */
export function FormPanel({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <form
      onSubmit={(e) => e.preventDefault()}
      noValidate
      aria-label={label}
      className="space-y-5 rounded-xl border border-border bg-card p-5 sm:p-6"
    >
      {children}
    </form>
  );
}

/** The result card. A polite live region, so screen readers hear the result update as inputs change. */
export function ResultPanel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div aria-live="polite" className={cn("min-w-0 rounded-xl border border-border bg-card p-5 sm:p-6", className)}>
      {children}
    </div>
  );
}

/** Shown in the result card until there is enough input to calculate. */
export function ResultPlaceholder({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-48 flex-col justify-center">
      <p className="font-display text-xl font-semibold">Your result appears here</p>
      <p className="mt-2 max-w-md text-muted-foreground">{children}</p>
    </div>
  );
}

/** One or two big figures at the top of a result. More than two is clutter; put the rest in details. */
export function Headlines({ children }: { children: React.ReactNode }) {
  return <dl className="grid gap-4 sm:grid-cols-2">{children}</dl>;
}

export function Headline({
  label,
  value,
  sub,
  emphasis = false,
}: {
  label: string;
  value: string;
  sub?: string;
  /** Teal-tinted variant for the figure the person most wants. */
  emphasis?: boolean;
}) {
  return (
    <div className={cn("rounded-lg p-4", emphasis ? "bg-accent text-accent-foreground" : "bg-muted/50")}>
      <dt className={cn("text-sm", !emphasis && "text-muted-foreground")}>{label}</dt>
      <dd className="num mt-1 font-display text-3xl font-semibold">{value}</dd>
      {sub && <dd className={cn("num mt-1 text-sm", !emphasis && "text-muted-foreground")}>{sub}</dd>}
    </div>
  );
}

/** Collapsible block for detail that most people do not need at first glance. */
export function MoreDetails({ summary, children }: { summary: string; children: React.ReactNode }) {
  return (
    <details className="group rounded-lg border border-border">
      <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between px-4 text-sm font-medium [&::-webkit-details-marker]:hidden">
        {summary}
        <span aria-hidden className="text-muted-foreground group-open:hidden">+</span>
        <span aria-hidden className="hidden text-muted-foreground group-open:inline">−</span>
      </summary>
      <div className="space-y-4 border-t border-border p-4">{children}</div>
    </details>
  );
}
