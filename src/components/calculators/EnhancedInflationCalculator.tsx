"use client"

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { AnimatedCard, AnimatedCardContent, AnimatedCardHeader, AnimatedCardTitle } from '@/components/ui/animated-card'
import { AnimatedInput } from '@/components/ui/animated-input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { StaggerContainer, FloatingElement, MagneticElement } from '@/components/ui/floating-elements'
import { useToast } from '@/components/ui/toast'
import { calculateInflationResult, validateInflationInputs, type InflationInputs, type InflationResult } from '@/lib/calculations/inflation'
import { cn } from '@/lib/utils'
import { TrendingUp, Calendar, DollarSign, BarChart3, AlertTriangle, Info } from 'lucide-react'

interface InflationFormData {
  initialAmount: string
  startYear: string
  endYear: string
  calculationType: 'amount' | 'purchasing_power'
}

export default function EnhancedInflationCalculator() {
  const { addToast } = useToast()
  
  const [formData, setFormData] = useState<InflationFormData>({
    initialAmount: '',
    startYear: '2020',
    endYear: '2024',
    calculationType: 'amount'
  })

  const [result, setResult] = useState<InflationResult | null>(null)
  const [errors, setErrors] = useState<string[]>([])
  const [isCalculating, setIsCalculating] = useState(false)
  const [calculationProgress, setCalculationProgress] = useState(0)
  // Real-time calculation with debouncing
  const calculateInflation = useCallback(() => {
    const initialAmount = parseFloat(formData.initialAmount)
    const startYear = parseInt(formData.startYear)
    const endYear = parseInt(formData.endYear)
    
    const inputs: Partial<InflationInputs> = {
      amount: isNaN(initialAmount) ? undefined : initialAmount,
      startDate: `${formData.startYear}-01`,
      endDate: `${formData.endYear}-12`,
      currency: 'NGN'
    }

    const validationErrors = validateInflationInputs(inputs)
    setErrors(validationErrors)
    
    if (validationErrors.length === 0 && inputs.amount) {
      setIsCalculating(true)
      setCalculationProgress(0)

      // Simulate calculation progress
      const progressInterval = setInterval(() => {
        setCalculationProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval)
            return 100
          }
          return prev + 20
        })
      }, 200)

      setTimeout(() => {
        try {
          const newResult = calculateInflationResult(inputs as InflationInputs)
          setResult(newResult)
          setIsCalculating(false)
          setCalculationProgress(0)
            // Show success toast
          addToast({
            type: 'success',
            message: `Inflation calculated: ${newResult.totalInflation.toFixed(1)}% over ${endYear - startYear} years`,
            duration: 3000
          })
        } catch (error) {
          setErrors([error instanceof Error ? error.message : 'Calculation error occurred'])
          setResult(null)
          setIsCalculating(false)
          setCalculationProgress(0)
        }
      }, 1200)
    } else {
      setResult(null)
    }
  }, [formData, addToast])

  // Debounced calculation
  useEffect(() => {
    const timer = setTimeout(calculateInflation, 500)
    return () => clearTimeout(timer)
  }, [calculateInflation])

  const handleInputChange = (field: keyof InflationFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const resetForm = () => {
    setFormData({
      initialAmount: '',
      startYear: '2020',
      endYear: '2024',
      calculationType: 'amount'
    })
    setResult(null)
    setErrors([])
  }

  const getCurrentYear = () => new Date().getFullYear()
  const getYearOptions = () => {
    const currentYear = getCurrentYear()
    const years = []
    for (let year = 2010; year <= currentYear; year++) {
      years.push(year.toString())
    }
    return years
  }

  const getInflationImpactColor = (rate: number) => {
    if (rate < 5) return 'text-green-500'
    if (rate < 10) return 'text-yellow-500'
    if (rate < 15) return 'text-orange-500'
    return 'text-red-500'
  }

  const getInflationDescription = (rate: number) => {
    if (rate < 2) return 'Very Low Inflation'
    if (rate < 5) return 'Low Inflation'
    if (rate < 10) return 'Moderate Inflation'
    if (rate < 15) return 'High Inflation'
    return 'Very High Inflation'
  }

  return (
    <div className="space-y-8">
      <StaggerContainer className="space-y-8">
        {/* Header */}
        <motion.div className="text-center space-y-4">
          <FloatingElement direction="circular" duration={6}>
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full">
              <TrendingUp className="w-8 h-8 text-primary" />
            </div>
          </FloatingElement>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Nigerian Inflation Calculator</h1>
            <p className="text-muted-foreground">Calculate inflation impact using Consumer Price Index (CPI) data</p>
          </div>
        </motion.div>

        {/* Info Banner */}
        <AnimatedCard className="max-w-4xl mx-auto border-blue-200 bg-blue-50/50">
          <AnimatedCardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">About Nigerian Inflation</p>
                <p>
                  This calculator uses Consumer Price Index (CPI) data to show how inflation affects purchasing power in Nigeria. 
                  Data is based on National Bureau of Statistics reports and Central Bank of Nigeria economic indicators.
                </p>
              </div>
            </div>
          </AnimatedCardContent>
        </AnimatedCard>

        {/* Calculator Form */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <AnimatedCard glowEffect>
            <AnimatedCardHeader>
              <AnimatedCardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Amount & Period
              </AnimatedCardTitle>
            </AnimatedCardHeader>
            <AnimatedCardContent className="space-y-6">
              <div className="space-y-4">
                <AnimatedInput
                  label="Initial Amount (₦)"
                  value={formData.initialAmount}
                  onChange={(e) => handleInputChange('initialAmount', e.target.value)}
                  placeholder="Enter amount in Naira"
                  type="number"
                  min="0"
                  step="1000"
                  leftIcon={<DollarSign className="w-4 h-4" />}
                  error={errors.find(e => e.includes('amount'))}
                  floatingLabel
                  animated
                />

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Start Year</label>
                    <Select value={formData.startYear} onValueChange={(value) => handleInputChange('startYear', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {getYearOptions().map(year => (
                          <SelectItem key={year} value={year}>{year}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">End Year</label>
                    <Select value={formData.endYear} onValueChange={(value) => handleInputChange('endYear', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {getYearOptions().map(year => (
                          <SelectItem key={year} value={year}>{year}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </AnimatedCardContent>
          </AnimatedCard>

          <AnimatedCard glowEffect>
            <AnimatedCardHeader>
              <AnimatedCardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Calculation Type
              </AnimatedCardTitle>
            </AnimatedCardHeader>
            <AnimatedCardContent className="space-y-6">
              <Tabs value={formData.calculationType} onValueChange={(value) => handleInputChange('calculationType', value)}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="amount" animated>Future Value</TabsTrigger>
                  <TabsTrigger value="purchasing_power" animated>Purchasing Power</TabsTrigger>
                </TabsList>

                <TabsContent value="amount" animated className="space-y-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">Future Value Calculation</h4>
                    <p className="text-sm text-muted-foreground">
                      Shows what amount you would need in the future to have the same purchasing power as your initial amount.
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="purchasing_power" animated className="space-y-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">Purchasing Power Analysis</h4>
                    <p className="text-sm text-muted-foreground">
                      Shows how much purchasing power your money has lost due to inflation over the selected period.
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </AnimatedCardContent>
          </AnimatedCard>
        </div>

        {/* Calculation Progress */}
        {isCalculating && (
          <AnimatedCard className="max-w-md mx-auto">
            <AnimatedCardContent className="pt-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-4 text-center"
              >
                <div className="text-lg font-semibold">Analyzing Inflation Data...</div>
                <Progress value={calculationProgress} animated showValue />
                <div className="text-sm text-muted-foreground">
                  Processing CPI data from {formData.startYear} to {formData.endYear}
                </div>
              </motion.div>
            </AnimatedCardContent>
          </AnimatedCard>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-center gap-4">
          <MagneticElement>
            <Button 
              onClick={calculateInflation} 
              disabled={isCalculating}
              size="lg"
              className="min-w-32"
            >
              {isCalculating ? 'Calculating...' : 'Calculate Inflation'}
            </Button>
          </MagneticElement>
          
          <Button variant="outline" onClick={resetForm} size="lg">
            Reset
          </Button>
        </div>

        {/* Results */}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">              <AnimatedCard className="text-center" glowEffect>
                <AnimatedCardContent className="pt-6">
                  <FloatingElement direction="up" amplitude={3}>
                    <div className={cn("text-2xl font-bold", getInflationImpactColor(result.totalInflation))}>
                      {result.totalInflation.toFixed(1)}%
                    </div>
                  </FloatingElement>
                  <div className="text-sm text-muted-foreground mt-2">Total Inflation</div>
                  <div className="text-xs text-muted-foreground">
                    {getInflationDescription(result.totalInflation)}
                  </div>
                </AnimatedCardContent>
              </AnimatedCard>

              <AnimatedCard className="text-center" glowEffect>
                <AnimatedCardContent className="pt-6">
                  <FloatingElement direction="down" amplitude={3}>
                    <div className="text-2xl font-bold text-primary">
                      {result.annualizedRate.toFixed(1)}%
                    </div>
                  </FloatingElement>
                  <div className="text-sm text-muted-foreground mt-2">Annual Average</div>
                </AnimatedCardContent>
              </AnimatedCard>

              <AnimatedCard className="text-center" glowEffect>
                <AnimatedCardContent className="pt-6">
                  <FloatingElement direction="left" amplitude={3}>
                    <div className="text-2xl font-bold text-green-500">
                      ₦{result.adjustedAmount.toLocaleString()}
                    </div>
                  </FloatingElement>
                  <div className="text-sm text-muted-foreground mt-2">
                    {formData.calculationType === 'amount' ? 'Future Value' : 'Current Value'}
                  </div>
                </AnimatedCardContent>
              </AnimatedCard>              <AnimatedCard className="text-center" glowEffect>
                <AnimatedCardContent className="pt-6">
                  <FloatingElement direction="right" amplitude={3}>
                    <div className="text-2xl font-bold text-red-500">
                      {result.purchasingPowerLoss.toFixed(1)}%
                    </div>
                  </FloatingElement>
                  <div className="text-sm text-muted-foreground mt-2">Power Lost</div>
                </AnimatedCardContent>
              </AnimatedCard>
            </div>

            {/* Detailed Analysis */}
            <AnimatedCard className="max-w-4xl mx-auto">
              <AnimatedCardHeader>
                <AnimatedCardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Inflation Impact Analysis
                </AnimatedCardTitle>
              </AnimatedCardHeader>
              <AnimatedCardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex justify-between items-center p-3 bg-muted rounded-lg"
                      >
                        <span className="font-medium">Initial Amount ({formData.startYear})</span>
                        <span className="font-mono text-primary">
                          ₦{parseFloat(formData.initialAmount).toLocaleString()}
                        </span>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="flex justify-between items-center p-3 bg-muted rounded-lg"
                      >
                        <span className="font-medium">
                          {formData.calculationType === 'amount' ? `Equivalent Amount (${formData.endYear})` : `Purchasing Power (${formData.endYear})`}
                        </span>
                        <span className="font-mono text-green-500">
                          ₦{result.adjustedAmount.toLocaleString()}
                        </span>
                      </motion.div>                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="flex justify-between items-center p-3 bg-red-50 border border-red-200 rounded-lg"
                      >
                        <span className="font-medium">Purchasing Power Lost</span>
                        <span className="font-mono text-red-600">
                          {result.purchasingPowerLoss.toFixed(1)}%
                        </span>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}                        className="flex justify-between items-center p-3 bg-blue-50 border border-blue-200 rounded-lg"
                      >
                        <span className="font-medium">Cumulative Inflation</span>
                        <span className="font-mono text-blue-600">
                          {result.totalInflation.toFixed(2)}%
                        </span>
                      </motion.div>
                    </div>

                    {/* Warning for high inflation */}
                    {result.totalInflation > 15 && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4 }}
                        className="flex items-start gap-3 p-4 bg-orange-50 border border-orange-200 rounded-lg"
                      >
                        <AlertTriangle className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />                        <div className="text-sm text-orange-800">
                          <p className="font-medium mb-1">High Inflation Alert</p>
                          <p>
                            The inflation rate of {result.totalInflation.toFixed(1)}% over this period is considered high. 
                            Consider investment options that can protect against inflation.
                          </p>
                        </div>
                      </motion.div>
                    )}                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium text-muted-foreground">Period Analysis</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                        <span className="text-sm">Period Duration</span>
                        <span className="font-mono text-sm">
                          {result.periodInYears.toFixed(1)} years
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                        <span className="text-sm">Start CPI</span>
                        <span className="font-mono text-sm">
                          {result.startCPI.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                        <span className="text-sm">End CPI</span>
                        <span className="font-mono text-sm">
                          {result.endCPI.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </AnimatedCardContent>
            </AnimatedCard>

            {/* Investment Recommendations */}
            <AnimatedCard className="max-w-2xl mx-auto">
              <AnimatedCardHeader>
                <AnimatedCardTitle>Investment Recommendations</AnimatedCardTitle>
              </AnimatedCardHeader>
              <AnimatedCardContent>
                <div className="space-y-3">
                  {[
                    'Consider Treasury Bills and Bonds for capital preservation',
                    'Diversify into real estate and equity investments',
                    'Look into inflation-indexed bonds if available',
                    'Regular review and rebalancing of portfolio',
                    'Emergency fund should account for inflation'
                  ].map((tip, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-2 text-sm"
                    >
                      <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                      {tip}
                    </motion.div>
                  ))}
                </div>
              </AnimatedCardContent>
            </AnimatedCard>
          </motion.div>
        )}
      </StaggerContainer>
    </div>
  )
}
