import { cn } from "@/lib/utils";

interface SegmentedProps<T extends string> {
  legend: string;
  name: string;
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string }[];
  className?: string;
}

/** Radio group styled as a segmented control. Native inputs, so keyboard and screen readers just work. */
export function Segmented<T extends string>({ legend, name, value, onChange, options, className }: SegmentedProps<T>) {
  return (
    <fieldset className={cn("min-w-0", className)}>
      <legend className="mb-1.5 text-sm font-medium">{legend}</legend>
      <div className="grid auto-cols-fr grid-flow-col gap-1 rounded-md border border-input bg-secondary p-1">
        {options.map((o) => (
          <label key={o.value} className="relative block">
            <input
              type="radio"
              name={name}
              value={o.value}
              checked={value === o.value}
              onChange={() => onChange(o.value)}
              className="peer sr-only"
            />
            <span className="flex h-9 cursor-pointer items-center justify-center rounded-sm px-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground peer-checked:bg-background peer-checked:font-semibold peer-checked:text-foreground peer-checked:shadow-sm peer-focus-visible:outline-2 peer-focus-visible:outline-offset-1 peer-focus-visible:outline-ring">
              {o.label}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
