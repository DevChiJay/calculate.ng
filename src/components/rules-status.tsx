import { formatIsoDate } from "@/lib/utils/format";

interface RulesLike {
  effectiveFrom: string;
  lastChecked: string;
  sources: { label: string; url: string }[];
}

/** "Rules effective … · last checked … · Sources: …", shown under the H1 of every rules-based page. */
export function RulesStatus({ rules }: { rules: RulesLike }) {
  return (
    <>
      Rules effective {formatIsoDate(rules.effectiveFrom)} · last checked {formatIsoDate(rules.lastChecked)} · Sources:{" "}
      {rules.sources.map((s, i) => (
        <span key={s.url}>
          {i > 0 && ", "}
          <a
            href={s.url}
            className="underline underline-offset-4 hover:text-foreground"
            target="_blank"
            rel="noopener noreferrer"
          >
            {s.label}
          </a>
        </span>
      ))}
    </>
  );
}
