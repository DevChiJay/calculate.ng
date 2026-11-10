"use client";

import { ChevronDown } from "lucide-react";
import { controlClass } from "@/components/ui/field";

/** A number input joined to a unit select, announced as one labelled group. */
export function UnitField({
  id,
  legend,
  error,
  hint,
  children,
}: {
  id: string;
  legend: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="min-w-0" aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}>
      <legend className="mb-1.5 text-sm font-medium">{legend}</legend>
      <div className="flex gap-2">{children}</div>
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-1.5 text-sm text-muted-foreground">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-sm font-medium text-destructive">
          {error}
        </p>
      )}
    </fieldset>
  );
}

export function UnitSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <div className="relative w-36 shrink-0">
      <select
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${controlClass} appearance-none pr-9`}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown aria-hidden className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
    </div>
  );
}
