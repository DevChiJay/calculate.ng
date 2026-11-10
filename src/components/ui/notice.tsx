import { cn } from "@/lib/utils";

/** A short callout. `warning` is for caveats the reader must not miss. */
export function Notice({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: "neutral" | "warning";
  className?: string;
}) {
  return (
    <div
      role="note"
      className={cn(
        "rounded-lg border p-4 text-sm leading-relaxed",
        tone === "warning" ? "border-warning/50 bg-warning/10 text-foreground" : "border-border bg-muted/40 text-muted-foreground",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Small inline tag, e.g. "Unverified". Colour is never the only cue: the text carries the meaning. */
export function Tag({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "warning" | "success" }) {
  return (
    <span
      className={cn(
        "shrink-0 rounded-full border px-2 py-0.5 text-xs font-medium",
        tone === "warning" && "border-warning/50 text-warning",
        tone === "success" && "border-success/50 text-success",
        tone === "neutral" && "border-border text-muted-foreground",
      )}
    >
      {children}
    </span>
  );
}
