import type { RulesId, TaxRules } from "../types";
import { RULES_2024 } from "./2024";
import { RULES_2026 } from "./2026";

export const RULES: Record<RulesId, TaxRules> = {
  "2024": RULES_2024,
  "2026": RULES_2026,
};

/** The regime currently in force. */
export const DEFAULT_RULES_ID: RulesId = "2026";

export function isRulesId(value: unknown): value is RulesId {
  return value === "2024" || value === "2026";
}
