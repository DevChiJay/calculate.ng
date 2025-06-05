"use client"

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { AnimatedCard, AnimatedCardContent, AnimatedCardHeader, AnimatedCardTitle } from '@/components/ui/animated-card'
import { AnimatedInput } from '@/components/ui/animated-input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TaxVisualization } from '@/components/ui/data-visualization'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { StaggerContainer, FloatingElement, MagneticElement } from '@/components/ui/floating-elements'
import { useToast } from '@/components/ui/toast'
import { calculateTaxResult, validateTaxInputs } from '@/lib/calculations/tax'
import type { TaxInputs, TaxResult } from '@/types/calculator'
import { cn } from '@/lib/utils'
import { Calculator, DollarSign, PieChart, TrendingUp, Download, Share2 } from 'lucide-react'

interface TaxFormData {
  annualSalary: string
  taxYear: string
  allowances: string
  pensionContribution: string
  nhisContribution: string
  lifeInsurance: string
  calculationType: 'annual' | 'monthly'
}

export default function EnhancedTaxCalculator() {
  const { addToast } = useToast()
  
  const [formData, setFormData] = useState<TaxFormData>({
    annualSalary: '',
    taxYear: '2024',
    allowances: '',
    pensionContribution: '',
    nhisContribution: '',
    lifeInsurance: '',
    calculationType: 'annual'
  })

  const [result, setResult] = useState<TaxResult | null>(null)
  const [errors, setErrors] = useState<string[]>([])
  const [isCalculating, setIsCalculating] = useState(false)
  const [calculationProgress, setCalculationProgress] = useState(0)
  // Real-time calculation with debouncing
  const calculateTax = useCallback(() => {
    const annualSalary = parseFloat(formData.annualSalary)
    const lifeInsurance = parseFloat(formData.lifeInsurance) || 0

    const inputs: Partial<TaxInputs> = {
      grossIncome: isNaN(annualSalary) ? undefined : annualSalary,
      paymentFrequency: formData.calculationType,
      includeMinimumTax: true,
      lifeAssurancePremium: lifeInsurance > 0 ? lifeInsurance : undefined,
      additionalReliefs: {
        disability: false,
        oldAge: false,
        dependentRelatives: 0
      }
    }

    const validationErrors = validateTaxInputs(inputs)
    setErrors(validationErrors)

    if (validationErrors.length === 0 && inputs.grossIncome) {
      setIsCalculating(true)
      setCalculationProgress(0)

      // Simulate calculation progress
      const progressInterval = setInterval(() => {
        setCalculationProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval)
            return 100
          }
          return prev + 25
        })
      }, 150)

      setTimeout(() => {
        try {
          const newResult = calculateTaxResult(inputs as TaxInputs)
          setResult(newResult)
          setIsCalculating(false)
          setCalculationProgress(0)

          // Show success toast
          addToast({
            type: 'success',
            message: `Tax calculated: ₦${newResult.finalTax.toLocaleString()} total tax`,
            duration: 3000
          })
        } catch (error) {
          setErrors([error instanceof Error ? error.message : 'Calculation error occurred'])
          setResult(null)
          setIsCalculating(false)
          setCalculationProgress(0)
        }
      }, 700)
    } else {
      setResult(null)
    }
  }, [formData, addToast])

  // Debounced calculation
  useEffect(() => {
    const timer = setTimeout(calculateTax, 500)
    return () => clearTimeout(timer)
  }, [calculateTax])

  const handleInputChange = (field: keyof TaxFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const resetForm = () => {
    setFormData({
      annualSalary: '',
      taxYear: '2024',
      allowances: '',
      pensionContribution: '',
      nhisContribution: '',
      lifeInsurance: '',
      calculationType: 'annual'
    })
    setResult(null)
    setErrors([])
  }

  const handleDownloadReport = () => {
    if (!result) return
    
    addToast({
      type: 'info',
      message: 'Tax report download feature coming soon!',
      duration: 2000
    })
  }

  const handleShareResults = () => {
    if (!result) return
    
    addToast({
      type: 'info',
      message: 'Share functionality coming soon!',
      duration: 2000
    })
  }
  const getTaxBreakdown = (result: TaxResult) => [
    { label: 'PAYE Tax', amount: result.incomeTax, color: 'rgb(239, 68, 68)' },
    { label: 'Pension (8%)', amount: result.allowanceBreakdown.pension, color: 'rgb(34, 197, 94)' },
    { label: 'NHIS', amount: result.allowanceBreakdown.nhis, color: 'rgb(59, 130, 246)' },
    { label: 'Life Insurance', amount: result.allowanceBreakdown.lifeAssurance, color: 'rgb(168, 85, 247)' }
  ]

  return (
    <div className="space-y-8">
      <StaggerContainer className="space-y-8">
        {/* Header */}
        <motion.div className="text-center space-y-4">
          <FloatingElement direction="circular" duration={5}>
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full">
              <Calculator className="w-8 h-8 text-primary" />
            </div>
          </FloatingElement>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Nigerian Tax Calculator</h1>
            <p className="text-muted-foreground">Calculate your PAYE tax with current Nigerian tax brackets</p>
          </div>
        </motion.div>

        {/* Calculator Form */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <AnimatedCard glowEffect>
            <AnimatedCardHeader>
              <AnimatedCardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Income Information
              </AnimatedCardTitle>
            </AnimatedCardHeader>
            <AnimatedCardContent className="space-y-6">
              <div className="space-y-4">
                <AnimatedInput
                  label="Annual Salary (₦)"
                  value={formData.annualSalary}
                  onChange={(e) => handleInputChange('annualSalary', e.target.value)}
                  placeholder="Enter your annual salary"
                  type="number"
                  min="0"
                  step="1000"
                  leftIcon={<DollarSign className="w-4 h-4" />}
                  error={errors.find(e => e.includes('salary'))}
                  floatingLabel
                  animated
                />

                <div className="space-y-2">
                  <label className="text-sm font-medium">Tax Year</label>
                  <Select value={formData.taxYear} onValueChange={(value) => handleInputChange('taxYear', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2024">2024</SelectItem>
                      <SelectItem value="2025">2025</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Calculation Type</label>
                  <Tabs value={formData.calculationType} onValueChange={(value) => handleInputChange('calculationType', value)}>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="annual" animated>Annual</TabsTrigger>
                      <TabsTrigger value="monthly" animated>Monthly</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </div>
            </AnimatedCardContent>
          </AnimatedCard>

          <AnimatedCard glowEffect>
            <AnimatedCardHeader>
              <AnimatedCardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Deductions & Allowances
              </AnimatedCardTitle>
            </AnimatedCardHeader>
            <AnimatedCardContent className="space-y-6">
              <div className="space-y-4">
                <AnimatedInput
                  label="Additional Allowances (₦)"
                  value={formData.allowances}
                  onChange={(e) => handleInputChange('allowances', e.target.value)}
                  placeholder="Housing, transport, etc."
                  type="number"
                  min="0"
                  step="1000"
                  floatingLabel
                  animated
                />

                <AnimatedInput
                  label="Pension Contribution (₦)"
                  value={formData.pensionContribution}
                  onChange={(e) => handleInputChange('pensionContribution', e.target.value)}
                  placeholder="Additional pension (8% auto-calculated)"
                  type="number"
                  min="0"
                  step="1000"
                  floatingLabel
                  animated
                />

                <AnimatedInput
                  label="NHIS Contribution (₦)"
                  value={formData.nhisContribution}
                  onChange={(e) => handleInputChange('nhisContribution', e.target.value)}
                  placeholder="Health insurance contribution"
                  type="number"
                  min="0"
                  step="100"
                  floatingLabel
                  animated
                />

                <AnimatedInput
                  label="Life Insurance (₦)"
                  value={formData.lifeInsurance}
                  onChange={(e) => handleInputChange('lifeInsurance', e.target.value)}
                  placeholder="Life insurance premium"
                  type="number"
                  min="0"
                  step="1000"
                  floatingLabel
                  animated
                />
              </div>
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
                <div className="text-lg font-semibold">Calculating Tax...</div>
                <Progress value={calculationProgress} animated showValue />
                <div className="text-sm text-muted-foreground">
                  Processing Nigerian tax brackets and deductions
                </div>
              </motion.div>
            </AnimatedCardContent>
          </AnimatedCard>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-center gap-4">
          <MagneticElement>
            <Button 
              onClick={calculateTax} 
              disabled={isCalculating}
              size="lg"
              className="min-w-32"
            >
              {isCalculating ? 'Calculating...' : 'Calculate Tax'}
            </Button>
          </MagneticElement>
          
          <Button variant="outline" onClick={resetForm} size="lg">
            Reset
          </Button>

          {result && (
            <>
              <Button variant="outline" onClick={handleDownloadReport} size="lg">
                <Download className="w-4 h-4 mr-2" />
                Download Report
              </Button>
              
              <Button variant="outline" onClick={handleShareResults} size="lg">
                <Share2 className="w-4 h-4 mr-2" />
                Share Results
              </Button>
            </>
          )}
        </div>

        {/* Results */}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <AnimatedCard className="text-center" glowEffect>
                <AnimatedCardContent className="pt-6">                  <FloatingElement direction="up" amplitude={3}>
                    <div className="text-3xl font-bold text-green-500">
                      ₦{result.netIncome.toLocaleString()}
                    </div>
                  </FloatingElement>
                  <div className="text-sm text-muted-foreground mt-2">
                    {formData.calculationType === 'monthly' ? 'Monthly' : 'Annual'} Net Salary
                  </div>
                </AnimatedCardContent>
              </AnimatedCard>

              <AnimatedCard className="text-center" glowEffect>
                <AnimatedCardContent className="pt-6">                  <FloatingElement direction="down" amplitude={3}>
                    <div className="text-3xl font-bold text-red-500">
                      ₦{result.finalTax.toLocaleString()}
                    </div>
                  </FloatingElement>
                  <div className="text-sm text-muted-foreground mt-2">Total Tax & Deductions</div>
                </AnimatedCardContent>
              </AnimatedCard>

              <AnimatedCard className="text-center" glowEffect>
                <AnimatedCardContent className="pt-6">                  <FloatingElement direction="circular" amplitude={2}>
                    <div className="text-3xl font-bold text-primary">
                      {((result.finalTax / result.grossIncome) * 100).toFixed(1)}%
                    </div>
                  </FloatingElement>
                  <div className="text-sm text-muted-foreground mt-2">Effective Tax Rate</div>
                </AnimatedCardContent>
              </AnimatedCard>
            </div>

            {/* Detailed Breakdown */}
            <AnimatedCard className="max-w-4xl mx-auto">
              <AnimatedCardHeader>
                <AnimatedCardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  Tax Breakdown
                </AnimatedCardTitle>
              </AnimatedCardHeader>
              <AnimatedCardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-3">                      {[
                        { label: 'Gross Salary', amount: result.grossIncome, color: 'text-primary' },
                        { label: 'PAYE Tax', amount: result.incomeTax, color: 'text-red-500' },
                        { label: 'Pension (8%)', amount: result.allowanceBreakdown.pension, color: 'text-blue-500' },
                        { label: 'NHIS', amount: result.allowanceBreakdown.nhis, color: 'text-green-500' },
                        { label: 'Life Insurance', amount: result.allowanceBreakdown.lifeAssurance, color: 'text-purple-500' },
                        { label: 'Net Salary', amount: result.netIncome, color: 'text-green-600 font-bold' }
                      ].map((item, index) => (
                        <motion.div
                          key={item.label}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex justify-between items-center py-2 border-b border-muted"
                        >
                          <span className="font-medium">{item.label}</span>
                          <span className={cn("font-mono", item.color)}>
                            ₦{item.amount.toLocaleString()}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </div>                  <div>
                    <TaxVisualization
                      grossSalary={result.grossIncome}
                      netSalary={result.netIncome}
                      totalTax={result.finalTax}
                      taxBreakdown={getTaxBreakdown(result)}
                    />
                  </div>
                </div>
              </AnimatedCardContent>
            </AnimatedCard>

            {/* Tax Brackets Information */}
            <AnimatedCard className="max-w-2xl mx-auto">
              <AnimatedCardHeader>
                <AnimatedCardTitle>Current Nigerian Tax Brackets (2024)</AnimatedCardTitle>
              </AnimatedCardHeader>
              <AnimatedCardContent>
                <div className="space-y-3">
                  {[
                    { range: '₦0 - ₦300,000', rate: '7%', color: 'bg-green-100 text-green-800' },
                    { range: '₦300,001 - ₦600,000', rate: '11%', color: 'bg-yellow-100 text-yellow-800' },
                    { range: '₦600,001 - ₦1,100,000', rate: '15%', color: 'bg-orange-100 text-orange-800' },
                    { range: '₁,100,001 - ₦1,600,000', rate: '19%', color: 'bg-red-100 text-red-800' },
                    { range: '₦1,600,001 - ₦3,200,000', rate: '21%', color: 'bg-purple-100 text-purple-800' },
                    { range: 'Above ₦3,200,000', rate: '24%', color: 'bg-gray-100 text-gray-800' }
                  ].map((bracket, index) => (
                    <motion.div
                      key={bracket.range}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex justify-between items-center p-3 rounded-lg border"
                    >
                      <span className="font-medium">{bracket.range}</span>
                      <span className={cn("px-2 py-1 rounded text-sm font-medium", bracket.color)}>
                        {bracket.rate}
                      </span>
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
