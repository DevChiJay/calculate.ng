"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Notice } from "@/components/ui/notice";
import { Segmented } from "@/components/ui/segmented";
import { TextField } from "@/components/ui/field";
import {
  CalculatorGrid,
  FormPanel,
  Headline,
  Headlines,
  ResultPanel,
  ResultPlaceholder,
} from "@/components/calculators/shared";
import { addVAT, removeVAT, validateVATInputs, type VatFieldError } from "@/lib/calculations/vat";
import { VAT_RULES } from "@/lib/vat/rules";
import { formatNaira, parseMoney } from "@/lib/utils/format";

type Mode = "add" | "remove";

const DEFAULT_RATE = String(VAT_RULES.rate);

export function VatCalculator() {
  const [mode, setMode] = useState<Mode>("add");
  const [amount, setAmount] = useState("");
  const [rate, setRate] = useState(DEFAULT_RATE);

  const outcome = useMemo(() => {
    const a = parseMoney(amount);
    const r = parseMoney(rate);
    const errors = validateVATInputs(a, r);
    if (errors.length > 0) return { result: null, errors, a, r };
    return { result: mode === "add" ? addVAT(a, r) : removeVAT(a, r), errors: [] as VatFieldError[], a, r };
  }, [mode, amount, rate]);

  // Only flag a field once something has been typed in it; a blank amount just waits for input.
  const errorFor = (field: VatFieldError["field"], raw: string) =>
    raw.trim() === "" ? undefined : outcome.errors.find((e) => e.field === field)?.message;

  const { result } = outcome;
  const ready = result !== null && amount.trim() !== "";

  return (
    <CalculatorGrid>
      <FormPanel label="VAT inputs">
        <Segmented
          legend="What do you want to do?"
          name="vat-mode"
          value={mode}
          onChange={setMode}
          options={[
            { value: "add", label: "Add VAT" },
            { value: "remove", label: "Remove VAT" },
          ]}
        />

        <TextField
          id="vat-amount"
          label={mode === "add" ? "Price before VAT" : "Price including VAT"}
          hint={Number.isFinite(outcome.a) && outcome.a > 0 ? formatNaira(outcome.a, 2) : undefined}
          prefix="₦"
          inputMode="decimal"
          autoComplete="off"
          placeholder="e.g. 100,000"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          error={errorFor("amount", amount)}
        />

        <TextField
          id="vat-rate"
          label="VAT rate"
          hint={`The standard rate is ${VAT_RULES.rate}%. Use 0 for a zero-rated item.`}
          suffix="%"
          inputMode="decimal"
          autoComplete="off"
          value={rate}
          onChange={(e) => setRate(e.target.value)}
          error={rate.trim() === "" ? "Enter a VAT rate (the standard rate is 7.5%)." : errorFor("rate", rate)}
        />

        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setAmount("");
            setRate(DEFAULT_RATE);
          }}
        >
          Clear
        </Button>
      </FormPanel>

      <ResultPanel className="space-y-6">
        {ready && result ? (
          <>
            <Headlines>
              <Headline emphasis label="VAT amount" value={formatNaira(result.vat, 2)} sub={`at ${outcome.r}%`} />
              <Headline
                label={mode === "add" ? "Price including VAT" : "Price before VAT"}
                value={formatNaira(mode === "add" ? result.gross : result.net, 2)}
              />
            </Headlines>

            <p className="num text-sm text-muted-foreground">
              {formatNaira(result.net, 2)} + {formatNaira(result.vat, 2)} VAT = {formatNaira(result.gross, 2)}
            </p>
          </>
        ) : (
          <ResultPlaceholder>
            Enter a price to add VAT to it, or a VAT-inclusive total to take the VAT out. The result updates as you type.
          </ResultPlaceholder>
        )}
        <Notice>
          Whether an item carries VAT depends on what it is. See the notes below, and check the Act or the tax authority for a
          specific item.
        </Notice>
      </ResultPanel>
    </CalculatorGrid>
  );
}
