"use client";

import { useState, useCallback, useEffect } from 'react';
import { Calculator, DollarSign, Receipt, TrendingUp, Info, Lightbulb } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  calculateTaxResult,
  validateTaxInputs,
  formatNGN,
  formatPercentage,
  monthlyToAnnual,
  annualToMonthly,
  getTaxOptimizationSuggestions
} from '@/lib/calculations/tax';
import type { TaxInputs, TaxResult } from '@/types/calculator';
import { HistoryDisplay } from './HistoryDisplay';
import { useCalculatorHistory } from '@/hooks/useCalculatorHistory';

export default function TaxCalculator() {
  const { addRecord } = useCalculatorHistory();
  
  const [formData, setFormData] = useState<{
    grossIncome: string;
    basicSalary: string;
    monthlyEmolument: string;
    lifeAssurancePremium: string;
    paymentFrequency: 'monthly' | 'annual';
    includeMinimumTax: boolean;
    disability: boolean;
    oldAge: boolean;
    dependentRelatives: string;
  }>({
    grossIncome: '',
    basicSalary: '',
    monthlyEmolument: '',
    lifeAssurancePremium: '',
    paymentFrequency: 'annual',
    includeMinimumTax: false,
    disability: false,
    oldAge: false,
    dependentRelatives: '0'
  });
  const [result, setResult] = useState<TaxResult | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  // Real-time calculation as user types
  const calculateTax = useCallback(() => {
    const grossIncome = parseFloat(formData.grossIncome);
    const basicSalary = parseFloat(formData.basicSalary);
    const monthlyEmolument = parseFloat(formData.monthlyEmolument);
    const lifeAssurancePremium = parseFloat(formData.lifeAssurancePremium);
    const dependentRelatives = parseInt(formData.dependentRelatives);

    // Convert monthly to annual if needed
    const annualGrossIncome = formData.paymentFrequency === 'monthly' ? monthlyToAnnual(grossIncome) : grossIncome;
    const annualBasicSalary = basicSalary && formData.paymentFrequency === 'monthly' ? monthlyToAnnual(basicSalary) : basicSalary;

    const inputs: Partial<TaxInputs> = {
      grossIncome: isNaN(annualGrossIncome) ? undefined : annualGrossIncome,
      basicSalary: isNaN(annualBasicSalary) ? undefined : annualBasicSalary,
      monthlyEmolument: isNaN(monthlyEmolument) ? undefined : monthlyEmolument,
      lifeAssurancePremium: isNaN(lifeAssurancePremium) ? undefined : lifeAssurancePremium,
      paymentFrequency: formData.paymentFrequency,
      includeMinimumTax: formData.includeMinimumTax,
      additionalReliefs: {
        disability: formData.disability,
        oldAge: formData.oldAge,
        dependentRelatives: isNaN(dependentRelatives) ? 0 : dependentRelatives
      }
    };

    const validationErrors = validateTaxInputs(inputs);
    setErrors(validationErrors);    if (validationErrors.length === 0 && inputs.grossIncome) {
      try {
        const taxResult = calculateTaxResult(inputs as TaxInputs);
        setResult(taxResult);
        
        // Add to history when calculation is complete
        if (taxResult && inputs.grossIncome) {
          addRecord('tax', inputs, taxResult);
        }
      } catch (error) {
        setErrors([error instanceof Error ? error.message : 'Calculation error occurred']);
        setResult(null);
      }
    } else {
      setResult(null);
    }
  }, [formData, addRecord]);

  // Calculate on form data change
  useEffect(() => {
    const timeoutId = setTimeout(calculateTax, 300); // Debounce
    return () => clearTimeout(timeoutId);
  }, [calculateTax]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const optimizationSuggestions = result && formData.grossIncome ? 
    getTaxOptimizationSuggestions({
      grossIncome: parseFloat(formData.grossIncome),
      basicSalary: parseFloat(formData.basicSalary) || undefined,
      monthlyEmolument: parseFloat(formData.monthlyEmolument) || undefined,
      lifeAssurancePremium: parseFloat(formData.lifeAssurancePremium) || undefined,
      paymentFrequency: formData.paymentFrequency,
      includeMinimumTax: formData.includeMinimumTax,
      additionalReliefs: {
        disability: formData.disability,
        oldAge: formData.oldAge,
        dependentRelatives: parseInt(formData.dependentRelatives) || 0
      }
    }, result) : [];

  const displayIncome = (amount: number) => {
    return formData.paymentFrequency === 'monthly' ? annualToMonthly(amount) : amount;
  };

  const formatDisplayAmount = (amount: number) => {
    const displayAmount = displayIncome(amount);
    return formatNGN(displayAmount);
  };

  return (
    <div className="space-y-6">
      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Nigerian Income Tax Calculator
          </CardTitle>
          <CardDescription>
            Calculate your income tax based on current Nigerian tax brackets and allowances (2024/2025 tax year)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Payment Frequency */}
            <div className="space-y-2">
              <Label htmlFor="paymentFrequency">Payment Frequency</Label>
              <Select 
                value={formData.paymentFrequency} 
                onValueChange={(value: 'monthly' | 'annual') => handleInputChange('paymentFrequency', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="annual">Annual</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Gross Income */}
            <div className="space-y-2">
              <Label htmlFor="grossIncome" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Gross {formData.paymentFrequency === 'monthly' ? 'Monthly' : 'Annual'} Income (₦)
              </Label>
              <Input
                id="grossIncome"
                type="number"
                placeholder="Enter your gross income"
                value={formData.grossIncome}
                onChange={(e) => handleInputChange('grossIncome', e.target.value)}
                className="text-lg"
              />
            </div>

            {/* Basic Salary */}
            <div className="space-y-2">
              <Label htmlFor="basicSalary">
                Basic {formData.paymentFrequency === 'monthly' ? 'Monthly' : 'Annual'} Salary (₦)
                <span className="text-sm text-muted-foreground ml-1">(Optional - for NHF & NHIS)</span>
              </Label>
              <Input
                id="basicSalary"
                type="number"
                placeholder="Enter basic salary component"
                value={formData.basicSalary}
                onChange={(e) => handleInputChange('basicSalary', e.target.value)}
              />
            </div>

            {/* Monthly Emolument */}
            <div className="space-y-2">
              <Label htmlFor="monthlyEmolument">
                Monthly Emolument (₦)
                <span className="text-sm text-muted-foreground ml-1">(Optional - for pension calculation)</span>
              </Label>
              <Input
                id="monthlyEmolument"
                type="number"
                placeholder="Enter monthly emolument"
                value={formData.monthlyEmolument}
                onChange={(e) => handleInputChange('monthlyEmolument', e.target.value)}
              />
            </div>

            {/* Life Assurance Premium */}
            <div className="space-y-2">
              <Label htmlFor="lifeAssurancePremium">
                Annual Life Assurance Premium (₦)
                <span className="text-sm text-muted-foreground ml-1">(Optional)</span>
              </Label>
              <Input
                id="lifeAssurancePremium"
                type="number"
                placeholder="Enter annual premium"
                value={formData.lifeAssurancePremium}
                onChange={(e) => handleInputChange('lifeAssurancePremium', e.target.value)}
              />
            </div>

            {/* Dependent Relatives */}
            <div className="space-y-2">
              <Label htmlFor="dependentRelatives">Number of Dependent Relatives</Label>
              <Input
                id="dependentRelatives"
                type="number"
                min="0"
                max="10"
                placeholder="0"
                value={formData.dependentRelatives}
                onChange={(e) => handleInputChange('dependentRelatives', e.target.value)}
              />
            </div>
          </div>

          {/* Additional Options */}
          <div className="space-y-4">
            <h4 className="font-medium">Additional Relief Options</h4>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="disability"
                  checked={formData.disability}
                  onChange={(e) => handleInputChange('disability', e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="disability">Disability Relief (₦25,000)</Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="oldAge"
                  checked={formData.oldAge}
                  onChange={(e) => handleInputChange('oldAge', e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="oldAge">Old Age Relief - 65+ years (₦20,000)</Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="includeMinimumTax"
                  checked={formData.includeMinimumTax}
                  onChange={(e) => handleInputChange('includeMinimumTax', e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="includeMinimumTax">Include Minimum Tax (0.5% of gross income)</Label>
              </div>
            </div>
          </div>

          {/* Validation Errors */}
          {errors.length > 0 && (
            <div className="bg-destructive/10 border border-destructive rounded-lg p-4">
              <h4 className="font-medium text-destructive mb-2">Please fix the following errors:</h4>
              <ul className="list-disc list-inside space-y-1">
                {errors.map((error, index) => (
                  <li key={index} className="text-sm text-destructive">{error}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <>
          {/* Tax Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Tax Calculation Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900">Gross Income</h4>
                  <p className="text-2xl font-bold text-blue-600">{formatDisplayAmount(result.grossIncome)}</p>
                  <p className="text-sm text-blue-700">{formData.paymentFrequency}</p>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium text-green-900">Total Allowances</h4>
                  <p className="text-2xl font-bold text-green-600">{formatDisplayAmount(result.totalAllowances)}</p>
                  <p className="text-sm text-green-700">Tax deductions</p>
                </div>

                <div className="bg-orange-50 p-4 rounded-lg">
                  <h4 className="font-medium text-orange-900">Income Tax</h4>
                  <p className="text-2xl font-bold text-orange-600">{formatDisplayAmount(result.finalTax)}</p>
                  <p className="text-sm text-orange-700">
                    {formatPercentage(result.effectiveRate)} effective rate
                  </p>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-medium text-purple-900">Net Income</h4>
                  <p className="text-2xl font-bold text-purple-600">{formatDisplayAmount(result.netIncome)}</p>
                  <p className="text-sm text-purple-700">Take-home pay</p>
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-medium mb-2">Key Metrics</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Effective Tax Rate:</span>
                      <span className="font-medium">{formatPercentage(result.effectiveRate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Marginal Tax Rate:</span>
                      <span className="font-medium">{formatPercentage(result.marginalRate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Taxable Income:</span>
                      <span className="font-medium">{formatDisplayAmount(result.taxableIncome)}</span>
                    </div>
                    {result.minimumTax > 0 && (
                      <div className="flex justify-between">
                        <span>Minimum Tax:</span>
                        <span className="font-medium">{formatDisplayAmount(result.minimumTax)}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Tax Breakdown</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Income Tax:</span>
                      <span className="font-medium">{formatDisplayAmount(result.incomeTax)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Final Tax Payable:</span>
                      <span className="font-medium">{formatDisplayAmount(result.finalTax)}</span>
                    </div>
                    {result.finalTax === result.minimumTax && result.minimumTax > result.incomeTax && (                      <p className="text-xs text-amber-600 mt-2">
                        * Minimum tax applies as it&apos;s higher than calculated income tax
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Allowance Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Allowances & Reliefs Breakdown</CardTitle>
              <CardDescription>
                Detailed breakdown of tax allowances and reliefs applied
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <span className="font-medium">Consolidated Relief Allowance</span>
                    <p className="text-sm text-muted-foreground">
                      Higher of ₦200,000 or 1% of gross income
                    </p>
                  </div>
                  <span className="font-bold">{formatDisplayAmount(result.allowanceBreakdown.consolidatedRelief)}</span>
                </div>

                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <span className="font-medium">National Housing Fund (NHF)</span>
                    <p className="text-sm text-muted-foreground">
                      2.5% of basic salary (max ₦100,000)
                    </p>
                  </div>
                  <span className="font-bold">{formatDisplayAmount(result.allowanceBreakdown.nationalHousingFund)}</span>
                </div>

                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <span className="font-medium">NHIS Contribution</span>
                    <p className="text-sm text-muted-foreground">
                      1.75% of basic salary (max ₦80,000)
                    </p>
                  </div>
                  <span className="font-bold">{formatDisplayAmount(result.allowanceBreakdown.nhis)}</span>
                </div>

                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <span className="font-medium">Pension Contribution</span>
                    <p className="text-sm text-muted-foreground">
                      8% of monthly emolument
                    </p>
                  </div>
                  <span className="font-bold">{formatDisplayAmount(result.allowanceBreakdown.pension)}</span>
                </div>

                {result.allowanceBreakdown.lifeAssurance > 0 && (
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <span className="font-medium">Life Assurance Premium</span>
                      <p className="text-sm text-muted-foreground">
                        15% of premium or 20% of net income (whichever is lower)
                      </p>
                    </div>
                    <span className="font-bold">{formatDisplayAmount(result.allowanceBreakdown.lifeAssurance)}</span>
                  </div>
                )}

                {result.allowanceBreakdown.additionalReliefs > 0 && (
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <span className="font-medium">Additional Reliefs</span>
                      <p className="text-sm text-muted-foreground">
                        Disability, old age, and dependent relative reliefs
                      </p>
                    </div>
                    <span className="font-bold">{formatDisplayAmount(result.allowanceBreakdown.additionalReliefs)}</span>
                  </div>
                )}

                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <span className="font-bold text-blue-900">Total Allowances</span>
                  <span className="font-bold text-blue-600">{formatDisplayAmount(result.totalAllowances)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tax Brackets */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Tax Brackets Applied
              </CardTitle>
              <CardDescription>
                Progressive tax calculation based on Nigerian tax brackets
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {result.taxBrackets.map((bracket, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <span className="font-medium">{bracket.description}</span>
                      <p className="text-sm text-muted-foreground">
                        {formatPercentage(bracket.rate)} on {formatNGN(bracket.taxableAmount)}
                      </p>
                    </div>
                    <span className="font-bold">{formatNGN(bracket.taxAmount)}</span>
                  </div>
                ))}
                
                <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <span className="font-bold text-orange-900">Total Income Tax</span>
                  <span className="font-bold text-orange-600">{formatNGN(result.incomeTax)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tax Optimization Suggestions */}
          {optimizationSuggestions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  Tax Optimization Suggestions
                </CardTitle>
                <CardDescription>
                  Ways to potentially reduce your tax liability
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {optimizationSuggestions.map((suggestion, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
                      <Info className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-amber-800">{suggestion}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Important Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Important Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• This calculator is based on Federal Capital Territory (FCT) Abuja tax rates</p>
                <p>• State governments may have different tax rates and allowances</p>
                <p>• Tax brackets and allowances are based on the 2024/2025 tax year</p>
                <p>• Consult a tax professional for complex situations or tax planning</p>
                <p>• This is for educational purposes and should not replace professional tax advice</p>
              </div>
            </CardContent>
          </Card>        </>
      )}

      {/* History Display */}
      <HistoryDisplay calculatorType="tax" />
    </div>
  );
}
