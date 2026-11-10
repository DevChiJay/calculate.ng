import { cn } from "@/lib/utils";

/** Small uppercase teal label that opens a page or section. */
export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p
      className={cn(
        "inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-primary",
        className,
      )}
    >
      <span className="h-px w-6 bg-primary/60" aria-hidden />
      {children}
    </p>
  );
}
