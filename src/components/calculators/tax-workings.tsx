import { Tag } from "@/components/ui/notice";
import { DataTable, td, th } from "@/components/content";
import type { TaxComputation } from "@/lib/tax/types";
import { formatNaira, formatPercent } from "@/lib/utils/format";

function Row({ label, value, strong = false }: { label: React.ReactNode; value: string; strong?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2.5">
      <dt className={strong ? "font-semibold text-foreground" : "text-muted-foreground"}>{label}</dt>
      <dd className={strong ? "font-semibold text-foreground" : "text-foreground"}>{value}</dd>
    </div>
  );
}

/** The yearly workings and the tax-by-band table. Shared by the PAYE and net-to-gross calculators. */
export function TaxWorkings({ result, idPrefix }: { result: TaxComputation; idPrefix: string }) {
  return (
    <>
      <section aria-labelledby={`${idPrefix}-workings`}>
        <h3 id={`${idPrefix}-workings`} className="text-base font-semibold">
          How we got there (yearly figures)
        </h3>
        <dl className="num mt-3 divide-y divide-border text-sm">
          <Row label="Gross income" value={formatNaira(result.annual.gross)} />
          {result.reliefs
            .filter((r) => r.amount > 0)
            .map((r) => (
              <Row
                key={r.id}
                label={
                  <span className="inline-flex flex-wrap items-center gap-2">
                    Less: {r.label}
                    {!r.verified && <Tag tone="warning">Unverified</Tag>}
                  </span>
                }
                value={`− ${formatNaira(r.amount)}`}
              />
            ))}
          <Row label="Taxable income" value={formatNaira(result.annual.taxableIncome)} strong />
          <Row label="PAYE tax" value={formatNaira(result.annual.tax)} strong />
          <Row label="Average rate on your gross income" value={formatPercent(result.annual.effectiveRate)} />
          <Row label="Rate on your next naira (top band reached)" value={formatPercent(result.annual.marginalRate, 0)} />
        </dl>
      </section>

      <section aria-labelledby={`${idPrefix}-bands`}>
        <h3 id={`${idPrefix}-bands`} className="mb-3 text-base font-semibold">
          Tax by band
        </h3>
        <DataTable caption="Tax charged in each band of taxable income">
          <thead>
            <tr className="border-b border-border">
              <th scope="col" className={th}>Taxable income band</th>
              <th scope="col" className={`${th} text-right`}>Rate</th>
              <th scope="col" className={`${th} text-right`}>In this band</th>
              <th scope="col" className={`${th} text-right`}>Tax</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {result.bands
              .filter((b) => b.taxableInBand > 0)
              .map((b) => (
                <tr key={b.from}>
                  <td className={td}>
                    {formatNaira(b.from)} to {b.to === null ? "no limit" : formatNaira(b.to)}
                  </td>
                  <td className={`${td} text-right`}>{b.rate}%</td>
                  <td className={`${td} text-right`}>{formatNaira(b.taxableInBand)}</td>
                  <td className={`${td} text-right`}>{formatNaira(b.tax)}</td>
                </tr>
              ))}
          </tbody>
        </DataTable>
      </section>
    </>
  );
}
