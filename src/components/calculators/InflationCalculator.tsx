'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { 
  calculateInflationResult, 
  validateInflationInputs, 
  formatNGN, 
  formatPercentage,
  getInflationInterpretation,
  getInflationRecommendations,
  type InflationInputs, 
  type InflationResult 
} from '@/lib/calculations/inflation';
import { getCPIDataForChart, getAvailableDateRange } from '@/lib/data/nigeria-cpi';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, Calculator, Calendar, DollarSign, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { HistoryDisplay } from './HistoryDisplay';
import { useCalculatorHistory } from '@/hooks/useCalculatorHistory';

interface InflationFormData {
  amount: string;
  startDate: string;
  endDate: string;
}

export default function InflationCalculator() {
  const { addRecord } = useCalculatorHistory();
  
  const [formData, setFormData] = useState<InflationFormData>({
    amount: '',
    startDate: '',
    endDate: ''
  });

  const [result, setResult] = useState<InflationResult | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [dateRange, setDateRange] = useState({ min: '', max: '' });

  // Get available date range on component mount
  useEffect(() => {
    const range = getAvailableDateRange();
    setDateRange(range);
    
    // Set default dates (last 5 years)
    const currentDate = new Date();
    const fiveYearsAgo = new Date(currentDate.getFullYear() - 5, currentDate.getMonth(), 1);
    
    setFormData(prev => ({
      ...prev,
      startDate: `${fiveYearsAgo.getFullYear()}-${String(fiveYearsAgo.getMonth() + 1).padStart(2, '0')}`,
      endDate: `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`
    }));
  }, []);

  // Real-time calculation as user types
  const calculateInflation = useCallback(() => {
    const amount = parseFloat(formData.amount);
    
    const inputs: Partial<InflationInputs> = {
      amount: isNaN(amount) ? undefined : amount,
      startDate: formData.startDate,
      endDate: formData.endDate,
      currency: 'NGN'
    };

    const validationErrors = validateInflationInputs(inputs);
    setErrors(validationErrors);    if (validationErrors.length === 0 && inputs.amount && inputs.startDate && inputs.endDate) {
      try {
        setIsCalculating(true);
        const inflationResult = calculateInflationResult(inputs as InflationInputs);
        setResult(inflationResult);
        
        // Add to history
        addRecord('inflation', inputs, inflationResult);
      } catch (error) {
        console.error('Inflation calculation error:', error);
        setErrors([error instanceof Error ? error.message : 'Calculation error occurred']);
        setResult(null);
      } finally {
        setIsCalculating(false);
      }
    } else {
      setResult(null);
    }
  }, [formData, addRecord]);

  // Calculate inflation whenever form data changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.amount && formData.startDate && formData.endDate) {
        calculateInflation();
      } else {
        setResult(null);
        setErrors([]);
      }
    }, 300); // Debounce calculations

    return () => clearTimeout(timer);
  }, [formData, calculateInflation]);

  const handleInputChange = (field: keyof InflationFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCalculate = () => {
    calculateInflation();
  };

  // Prepare chart data
  const chartData = result ? (() => {
    const startYear = parseInt(formData.startDate.split('-')[0]);
    const endYear = parseInt(formData.endDate.split('-')[0]);
    return getCPIDataForChart(startYear, endYear).map(point => ({
      date: point.date,
      cpi: point.cpi,
      inflationRate: point.inflationRate || 0,
      displayDate: `${point.year}-${String(point.month).padStart(2, '0')}`
    }));
  })() : [];

  const interpretation = result ? getInflationInterpretation(result.annualizedRate) : null;
  const recommendations = result ? getInflationRecommendations(result.annualizedRate) : [];

  return (
    <div className="space-y-6">
      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Nigerian Inflation Calculator
          </CardTitle>
          <CardDescription>
            Calculate the impact of inflation on your money using Consumer Price Index (CPI) data from the Nigerian Bureau of Statistics
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            {/* Amount Input */}
            <div className="space-y-2">
              <Label htmlFor="amount" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Amount (₦)
              </Label>
              <Input
                id="amount"
                type="number"
                placeholder="100,000"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                className={cn(
                  errors.some(error => error.includes('Amount')) && 'border-red-500'
                )}
              />
            </div>

            {/* Start Date */}
            <div className="space-y-2">
              <Label htmlFor="startDate" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Start Date
              </Label>
              <Input
                id="startDate"
                type="month"
                value={formData.startDate}
                min={dateRange.min}
                max={dateRange.max}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
                className={cn(
                  errors.some(error => error.includes('Start date')) && 'border-red-500'
                )}
              />
            </div>

            {/* End Date */}
            <div className="space-y-2">
              <Label htmlFor="endDate" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                End Date
              </Label>
              <Input
                id="endDate"
                type="month"
                value={formData.endDate}
                min={dateRange.min}
                max={dateRange.max}
                onChange={(e) => handleInputChange('endDate', e.target.value)}
                className={cn(
                  errors.some(error => error.includes('End date')) && 'border-red-500'
                )}
              />
            </div>
          </div>

          {/* Error Messages */}
          {errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-red-600 text-sm font-medium mb-1">
                <AlertTriangle className="h-4 w-4" />
                Please fix the following errors:
              </div>
              <ul className="text-red-600 text-sm space-y-1">
                {errors.map((error, index) => (
                  <li key={index} className="ml-6">• {error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Calculate Button */}
          <Button 
            onClick={handleCalculate} 
            disabled={isCalculating || errors.length > 0}
            className="w-full"
          >
            {isCalculating ? 'Calculating...' : 'Calculate Inflation Impact'}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Inflation</p>
                    <p className="text-2xl font-bold text-red-600">
                      {formatPercentage(result.totalInflation)}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Annualized Rate</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {formatPercentage(result.annualizedRate)}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Equivalent Value Today</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {formatNGN(result.adjustedAmount)}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Purchasing Power Loss</p>
                    <p className="text-2xl font-bold text-red-600">
                      {formatPercentage(result.purchasingPowerLoss)}
                    </p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Results */}
          <Card>
            <CardHeader>
              <CardTitle>Inflation Analysis</CardTitle>
              <CardDescription>
                Detailed breakdown of inflation impact over the selected period
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Original Amount</p>
                    <p className="text-lg font-semibold">{formatNGN(parseFloat(formData.amount))}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Value Today</p>
                    <p className="text-lg font-semibold">{formatNGN(result.adjustedAmount)}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Period</p>
                    <p className="text-lg font-semibold">{result.periodInYears.toFixed(1)} years</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">CPI Change</p>
                    <p className="text-lg font-semibold">{result.startCPI.toFixed(1)} → {result.endCPI.toFixed(1)}</p>
                  </div>
                </div>

                {interpretation && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Info className="h-5 w-5 text-blue-600" />
                      <h4 className="font-medium">Inflation Level: {interpretation.level.replace('-', ' ').toUpperCase()}</h4>
                    </div>
                    <p className={cn("text-sm", interpretation.color)}>
                      {interpretation.description}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Charts */}
          {chartData.length > 0 && (
            <div className="grid gap-6 lg:grid-cols-2">
              {/* CPI Trend Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Consumer Price Index Trend</CardTitle>
                  <CardDescription>
                    CPI values over the selected period (Base: 2009 = 100)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="displayDate" 
                          tick={{ fontSize: 12 }}
                          interval="preserveStartEnd"
                        />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip 
                          labelFormatter={(label) => `Date: ${label}`}
                          formatter={(value: number) => [value.toFixed(1), 'CPI']}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="cpi" 
                          stroke="#2563eb" 
                          strokeWidth={2}
                          dot={{ fill: '#2563eb' }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Inflation Rate Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Inflation Rate Trend</CardTitle>
                  <CardDescription>
                    Year-over-year inflation rates (%)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="displayDate" 
                          tick={{ fontSize: 12 }}
                          interval="preserveStartEnd"
                        />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip 
                          labelFormatter={(label) => `Date: ${label}`}
                          formatter={(value: number) => [`${value.toFixed(1)}%`, 'Inflation Rate']}
                        />
                        <Bar 
                          dataKey="inflationRate" 
                          fill="#dc2626"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  Financial Recommendations
                </CardTitle>
                <CardDescription>
                  Based on the calculated inflation rate of {formatPercentage(result.annualizedRate)} per year
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {recommendations.map((recommendation, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-sm">{recommendation}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>          )}

          {/* History Display */}
          <HistoryDisplay calculatorType="inflation" />
        </div>
      )}
    </div>
  );
}
