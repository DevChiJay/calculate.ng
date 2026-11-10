"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { TAX_EMPTY, readTaxParams, toTaxInputs, writeTaxParams, type TaxFormState } from "./tax-params";

const subscribeNoop = () => () => {};

/**
 * Form state for the tax calculators, kept in sync with the address bar so the current URL is always a
 * shareable link. The pages are static, so a shared link is read on the client: useSyncExternalStore gives ""
 * during hydration and the real query string right after (no mismatch, no effect-driven setState).
 */
export function useTaxForm(amountKey: string) {
  const search = useSyncExternalStore(subscribeNoop, () => window.location.search, () => "");
  const fromUrl = useMemo(() => readTaxParams(search, amountKey), [search, amountKey]);
  const [edited, setEdited] = useState<TaxFormState | null>(null);
  const form = edited ?? fromUrl;
  const [copied, setCopied] = useState<"idle" | "ok" | "fail">("idle");

  const set = <K extends keyof TaxFormState>(key: K, value: TaxFormState[K]) =>
    setEdited((prev) => ({ ...(prev ?? fromUrl), [key]: value }));
  const clear = () => setEdited({ ...TAX_EMPTY, period: form.period });

  useEffect(() => {
    if (!edited) return;
    const t = setTimeout(() => {
      window.history.replaceState(null, "", `${window.location.pathname}${writeTaxParams(edited, amountKey)}`);
    }, 300);
    return () => clearTimeout(t);
  }, [edited, amountKey]);

  const parsed = useMemo(() => toTaxInputs(form), [form]);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}${window.location.pathname}${writeTaxParams(form, amountKey)}`,
      );
      setCopied("ok");
    } catch {
      setCopied("fail");
    }
    setTimeout(() => setCopied("idle"), 2500);
  }

  return { form, set, clear, parsed, copied, copyLink };
}
