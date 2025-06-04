'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { calculateBMIResult, validateBMIInputs, type BMIInputs, type BMIResult } from '@/lib/calculations/bmi';
import { cn } from '@/lib/utils';
import { HistoryDisplay } from './HistoryDisplay';
import { useCalculatorHistory } from '@/hooks/useCalculatorHistory';

interface BMIFormData {
  weight: string;
  height: string;
  heightFeet: string;
  heightInches: string;
  unit: 'metric' | 'imperial';
}

export default function BMICalculator() {
  const { addRecord } = useCalculatorHistory();
  
  const [formData, setFormData] = useState<BMIFormData>({
    weight: '',
    height: '',
    heightFeet: '',
    heightInches: '',
    unit: 'metric'
  });

  const [result, setResult] = useState<BMIResult | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);

  // Real-time calculation as user types
  const calculateBMI = useCallback(() => {
    const weight = parseFloat(formData.weight);
    const height = parseFloat(formData.height);
    const heightFeet = parseFloat(formData.heightFeet);
    const heightInches = parseFloat(formData.heightInches);

    const inputs: Partial<BMIInputs> = {
      weight: isNaN(weight) ? undefined : weight,
      height: isNaN(height) ? undefined : height,
      heightFeet: isNaN(heightFeet) ? undefined : heightFeet,
      heightInches: isNaN(heightInches) ? undefined : heightInches,
      unit: formData.unit
    };

    const validationErrors = validateBMIInputs(inputs);
    setErrors(validationErrors);    if (validationErrors.length === 0 && inputs.weight) {
      try {
        setIsCalculating(true);
        const bmiResult = calculateBMIResult(inputs as BMIInputs);
        setResult(bmiResult);
        
        // Add to history when calculation is complete and all required inputs are present
        if (bmiResult && inputs.weight && (inputs.height || (inputs.heightFeet && inputs.heightInches))) {
          addRecord('bmi', inputs, bmiResult);
        }
      } catch (error) {
        console.error('BMI calculation error:', error);
        setErrors([error instanceof Error ? error.message : 'Calculation error occurred']);
        setResult(null);
      } finally {
        setIsCalculating(false);
      }
    } else {
      setResult(null);
    }
  }, [formData, addRecord]);

  // Calculate BMI whenever form data changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.weight && (
        (formData.unit === 'metric' && formData.height) ||
        (formData.unit === 'imperial' && formData.heightFeet && formData.heightInches !== '')
      )) {
        calculateBMI();
      } else {
        setResult(null);
        setErrors([]);
      }
    }, 300); // Debounce calculations

    return () => clearTimeout(timer);
  }, [formData, calculateBMI]);

  const handleInputChange = (field: keyof BMIFormData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value;
    // Allow only numbers and decimal points
    if (field !== 'unit' && value && !/^\d*\.?\d*$/.test(value)) {
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleUnitChange = (value: 'metric' | 'imperial') => {
    setFormData(prev => ({
      ...prev,
      unit: value,
      // Clear height fields when switching units
      height: '',
      heightFeet: '',
      heightInches: ''
    }));
    setResult(null);
    setErrors([]);
  };

  const clearForm = () => {
    setFormData({
      weight: '',
      height: '',
      heightFeet: '',
      heightInches: '',
      unit: 'metric'
    });
    setResult(null);
    setErrors([]);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Calculator Form */}
      <Card>
        <CardHeader>
          <CardTitle>BMI Calculator</CardTitle>
          <CardDescription>
            Calculate your Body Mass Index (BMI) and get personalized health recommendations.
            Supports both metric and imperial units with real-time calculations.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Unit Selection */}
          <div className="space-y-2">
            <Label htmlFor="unit-select">Unit System</Label>
            <Select value={formData.unit} onValueChange={handleUnitChange}>
              <SelectTrigger id="unit-select" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="metric">Metric (kg, cm)</SelectItem>
                <SelectItem value="imperial">Imperial (lbs, ft/in)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Weight Input */}
            <div className="space-y-2">
              <Label htmlFor="weight">
                Weight {formData.unit === 'metric' ? '(kg)' : '(lbs)'}
              </Label>
              <Input
                id="weight"
                type="text"
                inputMode="decimal"
                placeholder={formData.unit === 'metric' ? 'e.g., 70' : 'e.g., 154'}
                value={formData.weight}
                onChange={handleInputChange('weight')}
                className={cn(
                  errors.some(error => error.includes('Weight')) && "border-red-500 focus:border-red-500"
                )}
              />
            </div>

            {/* Height Input */}
            {formData.unit === 'metric' ? (
              <div className="space-y-2">
                <Label htmlFor="height">Height (cm)</Label>
                <Input
                  id="height"
                  type="text"
                  inputMode="decimal"
                  placeholder="e.g., 170"
                  value={formData.height}
                  onChange={handleInputChange('height')}
                  className={cn(
                    errors.some(error => error.includes('Height')) && "border-red-500 focus:border-red-500"
                  )}
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Height</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Input
                      type="text"
                      inputMode="numeric"
                      placeholder="Feet"
                      value={formData.heightFeet}
                      onChange={handleInputChange('heightFeet')}
                      className={cn(
                        errors.some(error => error.includes('feet')) && "border-red-500 focus:border-red-500"
                      )}
                    />
                  </div>
                  <div>
                    <Input
                      type="text"
                      inputMode="numeric"
                      placeholder="Inches"
                      value={formData.heightInches}
                      onChange={handleInputChange('heightInches')}
                      className={cn(
                        errors.some(error => error.includes('inches')) && "border-red-500 focus:border-red-500"
                      )}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Error Display */}
          {errors.length > 0 && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <h4 className="text-sm font-medium text-red-800 mb-2">Please fix the following errors:</h4>
              <ul className="text-sm text-red-700 space-y-1">
                {errors.map((error, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-red-500 mt-0.5">•</span>
                    {error}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button
              onClick={calculateBMI}
              disabled={isCalculating || errors.length > 0 || !formData.weight}
              className="flex-1"
            >
              {isCalculating ? 'Calculating...' : 'Calculate BMI'}
            </Button>
            <Button
              variant="outline"
              onClick={clearForm}
              className="px-6"
            >
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results Display */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Your BMI Results</CardTitle>
            <CardDescription>
              Based on your height and weight measurements
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* BMI Score */}
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">
                {result.bmi}
              </div>
              <div className={cn(
                "inline-flex px-4 py-2 rounded-full text-sm font-medium border",
                result.categoryColor
              )}>
                {result.category}
              </div>
            </div>

            {/* Health Risk */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">Health Risk Assessment</h4>
              <p className="text-gray-700">{result.healthRisk}</p>
            </div>

            {/* BMI Categories Reference */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="text-center p-3 rounded-lg bg-blue-50 border border-blue-200">
                <div className="text-sm font-medium text-blue-800">Underweight</div>
                <div className="text-xs text-blue-600">Below 18.5</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-green-50 border border-green-200">
                <div className="text-sm font-medium text-green-800">Normal</div>
                <div className="text-xs text-green-600">18.5 - 24.9</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                <div className="text-sm font-medium text-yellow-800">Overweight</div>
                <div className="text-xs text-yellow-600">25.0 - 29.9</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-orange-50 border border-orange-200">
                <div className="text-sm font-medium text-orange-800">Obese I</div>
                <div className="text-xs text-orange-600">30.0 - 34.9</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-red-50 border border-red-200">
                <div className="text-sm font-medium text-red-800">Obese II</div>
                <div className="text-xs text-red-600">35.0 - 39.9</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-red-100 border border-red-300">
                <div className="text-sm font-medium text-red-900">Obese III</div>
                <div className="text-xs text-red-700">40.0 and above</div>
              </div>
            </div>

            {/* Health Recommendations */}
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-3">Health Recommendations</h4>
              <ul className="space-y-2">
                {result.recommendations.map((recommendation, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="text-blue-500 mt-1.5 text-xs">●</span>
                    <span className="text-blue-800 text-sm">{recommendation}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Disclaimer */}
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800">
                <strong>Important:</strong> BMI is a general indicator and may not be accurate for athletes, 
                pregnant women, elderly, or those with high muscle mass. Always consult with healthcare 
                professionals for personalized medical advice.
              </p>
            </div>          </CardContent>
        </Card>
      )}

      {/* History Display */}
      <HistoryDisplay calculatorType="bmi" />
    </div>
  );
}
