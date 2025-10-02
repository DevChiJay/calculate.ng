import { useState, useEffect, useCallback } from 'react';
import { calculateInflationResult, validateInflationInputs, type InflationInputs, type InflationResult } from '@/lib/calculations/inflation';

export interface UseInflationCalculatorOptions {
  auto?: boolean;      // auto run with debounce
  debounceMs?: number; // default 500ms
}

export interface InflationFormState {
  initialAmount: string;
  startYear: string;
  endYear: string;
  calculationType: 'amount' | 'purchasing_power';
}

export interface UseInflationCalculatorReturn {
  form: InflationFormState;
  setForm: <K extends keyof InflationFormState>(key: K, value: InflationFormState[K]) => void;
  reset: () => void;
  result: InflationResult | null;
  errors: string[];
  isCalculating: boolean;
  progress: number;
  calculate: () => void;
  yearOptions: string[];
}

const DEFAULT_FORM: InflationFormState = {
  initialAmount: '',
  startYear: '2020',
  endYear: '2024',
  calculationType: 'amount'
};

function getCurrentYear() { return new Date().getFullYear(); }
function buildYearOptions(): string[] { const arr: string[] = []; const current = getCurrentYear(); for (let y = 2010; y <= current; y++) arr.push(y.toString()); return arr; }

export function useInflationCalculator(options: UseInflationCalculatorOptions = {}): UseInflationCalculatorReturn {
  const { auto = true, debounceMs = 500 } = options;

  const [form, setFormState] = useState<InflationFormState>(DEFAULT_FORM);
  const [result, setResult] = useState<InflationResult | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [progress, setProgress] = useState(0);
  const yearOptions = buildYearOptions();

  const setForm = useCallback(<K extends keyof InflationFormState>(key: K, value: InflationFormState[K]) => {
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
    const initialAmount = parseFloat(form.initialAmount);
    const startYear = parseInt(form.startYear);
    const endYear = parseInt(form.endYear);

    const inputs: Partial<InflationInputs> = {
      amount: isNaN(initialAmount) ? undefined : initialAmount,
      startDate: `${form.startYear}-01`,
      endDate: `${form.endYear}-12`,
      currency: 'NGN'
    };

    const validationErrors = validateInflationInputs(inputs);
    setErrors(validationErrors);

    if (validationErrors.length === 0 && inputs.amount) {
      setIsCalculating(true);
      setProgress(0);

      const start = Date.now();
      const interval = setInterval(() => {
        setProgress(p => {
          if (p >= 100) { clearInterval(interval); return 100; }
          return p + 20;
        });
      }, 200);

      setTimeout(() => {
        try {
          const newResult = calculateInflationResult(inputs as InflationInputs);
          setResult(newResult);
        } catch (e) {
          setErrors([e instanceof Error ? e.message : 'Calculation error']);
          setResult(null);
        } finally {
          setIsCalculating(false);
          setProgress(0);
        }
      }, Math.max(1200 - (Date.now() - start), 0));
    } else {
      setResult(null);
    }
  }, [form]);

  useEffect(() => {
    if (!auto) return;
    const timer = setTimeout(calculate, debounceMs);
    return () => clearTimeout(timer);
  }, [calculate, auto, debounceMs]);

  return { form, setForm, reset, result, errors, isCalculating, progress, calculate, yearOptions };
}
