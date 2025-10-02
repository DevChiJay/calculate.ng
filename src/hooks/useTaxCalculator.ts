import { useState, useEffect, useCallback } from 'react';
import { calculateTaxResult, validateTaxInputs } from '@/lib/calculations/tax';
import type { TaxInputs, TaxResult } from '@/types/calculator';

export interface UseTaxCalculatorOptions {
  auto?: boolean;           // auto run with debounce
  debounceMs?: number;      // default 500ms
}

export interface TaxFormState {
  annualSalary: string;
  taxYear: string;
  lifeInsurance: string;
  calculationType: 'annual' | 'monthly';
}

export interface UseTaxCalculatorReturn {
  form: TaxFormState;
  setForm: <K extends keyof TaxFormState>(key: K, value: TaxFormState[K]) => void;
  reset: () => void;
  result: TaxResult | null;
  errors: string[];
  isCalculating: boolean;
  progress: number;
  calculate: () => void;
}

const DEFAULT_FORM: TaxFormState = {
  annualSalary: '',
  taxYear: '2024',
  lifeInsurance: '',
  calculationType: 'annual'
};

export function useTaxCalculator(options: UseTaxCalculatorOptions = {}): UseTaxCalculatorReturn {
  const { auto = true, debounceMs = 500 } = options;

  const [form, setFormState] = useState<TaxFormState>(DEFAULT_FORM);
  const [result, setResult] = useState<TaxResult | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [progress, setProgress] = useState(0);

  const setForm = useCallback(<K extends keyof TaxFormState>(key: K, value: TaxFormState[K]) => {
    setFormState(prev => ({ ...prev, [key]: value }));
  }, []);

  const reset = useCallback(() => {
    setFormState(DEFAULT_FORM);
    setResult(null);
    setErrors([]);
    setProgress(0);
    setIsCalculating(false);
  }, []);

  const calculate = useCallback(() => {
    const annualSalary = parseFloat(form.annualSalary);
    const lifeInsurance = parseFloat(form.lifeInsurance) || 0;

    const inputs: Partial<TaxInputs> = {
      grossIncome: isNaN(annualSalary) ? undefined : annualSalary,
      paymentFrequency: form.calculationType,
      includeMinimumTax: true,
      lifeAssurancePremium: lifeInsurance > 0 ? lifeInsurance : undefined,
      additionalReliefs: {
        disability: false,
        oldAge: false,
        dependentRelatives: 0
      }
    };

    const validationErrors = validateTaxInputs(inputs);
    setErrors(validationErrors);

    if (validationErrors.length === 0 && inputs.grossIncome) {
      setIsCalculating(true);
      setProgress(0);

      const start = Date.now();
      const interval = setInterval(() => {
        setProgress(p => {
          if (p >= 100) { clearInterval(interval); return 100; }
          return p + 25; // mimic staged progress
        });
      }, 150);

      // simulate async like original component
      setTimeout(() => {
        try {
          const newResult = calculateTaxResult(inputs as TaxInputs);
          setResult(newResult);
        } catch (e) {
          setErrors([e instanceof Error ? e.message : 'Calculation error']);
          setResult(null);
        } finally {
          setIsCalculating(false);
          setProgress(0);
        }
      }, Math.max(700 - (Date.now() - start), 0));
    } else {
      setResult(null);
    }
  }, [form]);

  // Debounce
  useEffect(() => {
    if (!auto) return;
    const timer = setTimeout(calculate, debounceMs);
    return () => clearTimeout(timer);
  }, [calculate, auto, debounceMs]);

  return { form, setForm, reset, result, errors, isCalculating, progress, calculate };
}
