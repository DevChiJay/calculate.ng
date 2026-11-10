import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const controlClass =
  "h-11 w-full rounded-md border border-input bg-background px-3 text-base text-foreground placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-destructive";

interface FieldShellProps {
  id: string;
  label: React.ReactNode;
  hint?: React.ReactNode;
  error?: string;
  /** Small tag shown beside the label, e.g. "Unverified". */
  badge?: React.ReactNode;
  className?: string;
  children: (aria: { id: string; "aria-describedby"?: string; "aria-invalid"?: boolean }) => React.ReactNode;
}

/** Label + control + hint + error, wired together with ids so screen readers get the whole story. */
function FieldShell({ id, label, hint, error, badge, className, children }: FieldShellProps) {
  const describedBy = [hint ? `${id}-hint` : null, error ? `${id}-error` : null].filter(Boolean).join(" ") || undefined;
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 flex items-center justify-between gap-2 text-sm font-medium">
        <span>{label}</span>
        {badge}
      </label>
      {children({ id, "aria-describedby": describedBy, "aria-invalid": error ? true : undefined })}
      {hint && (
        <p id={`${id}-hint`} className="mt-1.5 text-sm text-muted-foreground">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-sm font-medium text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

interface TextFieldProps extends Omit<React.ComponentProps<"input">, "id" | "prefix"> {
  id: string;
  label: React.ReactNode;
  hint?: React.ReactNode;
  error?: string;
  badge?: React.ReactNode;
  /** Symbol shown inside the field before the value, e.g. "₦". */
  prefix?: string;
  suffix?: string;
  wrapperClassName?: string;
}

export function TextField({
  id,
  label,
  hint,
  error,
  badge,
  prefix,
  suffix,
  wrapperClassName,
  className,
  ...input
}: TextFieldProps) {
  return (
    <FieldShell id={id} label={label} hint={hint} error={error} badge={badge} className={wrapperClassName}>
      {(aria) => (
        <div className="relative">
          {prefix && (
            <span
              aria-hidden
              className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-base text-muted-foreground"
            >
              {prefix}
            </span>
          )}
          <input {...aria} {...input} className={cn(controlClass, prefix && "pl-8", suffix && "pr-12", className)} />
          {suffix && (
            <span
              aria-hidden
              className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-muted-foreground"
            >
              {suffix}
            </span>
          )}
        </div>
      )}
    </FieldShell>
  );
}

interface SelectFieldProps extends Omit<React.ComponentProps<"select">, "id"> {
  id: string;
  label: React.ReactNode;
  hint?: React.ReactNode;
  error?: string;
  wrapperClassName?: string;
}

/** Native select: best keyboard, screen-reader and low-end-phone behaviour, no JS required. */
export function SelectField({ id, label, hint, error, wrapperClassName, className, children, ...select }: SelectFieldProps) {
  return (
    <FieldShell id={id} label={label} hint={hint} error={error} className={wrapperClassName}>
      {(aria) => (
        <div className="relative">
          <select {...aria} {...select} className={cn(controlClass, "appearance-none pr-10", className)}>
            {children}
          </select>
          <ChevronDown
            aria-hidden
            className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          />
        </div>
      )}
    </FieldShell>
  );
}
