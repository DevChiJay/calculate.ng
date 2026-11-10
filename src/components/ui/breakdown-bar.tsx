import { formatNaira } from "@/lib/utils/format";

export interface BreakdownSegment {
  label: string;
  value: number;
  /** Tailwind background class, e.g. "bg-primary". */
  swatch: string;
}

/**
 * Stacked bar showing how an amount splits up. Pure CSS (no chart library): the legend carries
 * the exact figures, so the bar is decorative for assistive technology.
 */
export function BreakdownBar({ segments, caption }: { segments: BreakdownSegment[]; caption: string }) {
  const total = segments.reduce((s, x) => s + Math.max(0, x.value), 0);
  if (total <= 0) return null;
  return (
    <figure>
      <div
        role="img"
        aria-label={`${caption}: ${segments.map((s) => `${s.label} ${formatNaira(s.value)}`).join(", ")}`}
        className="flex h-3 w-full overflow-hidden rounded-full bg-muted"
      >
        {segments
          .filter((s) => s.value > 0)
          .map((s) => (
            <span key={s.label} className={s.swatch} style={{ width: `${(s.value / total) * 100}%` }} />
          ))}
      </div>
      <figcaption className="mt-3 grid gap-2 text-sm sm:grid-cols-3">
        {segments.map((s) => (
          <span key={s.label} className="flex items-center gap-2">
            <span aria-hidden className={`size-2.5 shrink-0 rounded-full ${s.swatch}`} />
            <span className="text-muted-foreground">{s.label}</span>
            <span className="num ml-auto font-medium sm:ml-0">{formatNaira(s.value)}</span>
          </span>
        ))}
      </figcaption>
    </figure>
  );
}
