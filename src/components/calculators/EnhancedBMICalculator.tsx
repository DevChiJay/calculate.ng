"use client"

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { AnimatedCard, AnimatedCardContent, AnimatedCardHeader, AnimatedCardTitle } from '@/components/ui/animated-card'
import { AnimatedInput } from '@/components/ui/animated-input'
import { Button } from '@/components/ui/button'
import { BMIVisualization } from '@/components/ui/data-visualization'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { StaggerContainer, FloatingElement } from '@/components/ui/floating-elements'
import { useToast } from '@/components/ui/toast'
import { calculateBMIResult, validateBMIInputs, type BMIInputs, type BMIResult } from '@/lib/calculations/bmi'
import { cn } from '@/lib/utils'
import { Scale, Ruler, Heart, Activity } from 'lucide-react'

interface BMIFormData {
  weight: string
  height: string
  heightFeet: string
  heightInches: string
  unit: 'metric' | 'imperial'
}

export default function EnhancedBMICalculator() {
  const { addToast } = useToast()
  
  const [formData, setFormData] = useState<BMIFormData>({
    weight: '',
    height: '',
    heightFeet: '',
    heightInches: '',
    unit: 'metric'
  })

  const [result, setResult] = useState<BMIResult | null>(null)
  const [errors, setErrors] = useState<string[]>([])
  const [isCalculating, setIsCalculating] = useState(false)
  const [calculationProgress, setCalculationProgress] = useState(0)
  // Real-time calculation with debouncing
  const calculateBMI = useCallback(() => {
    const weight = parseFloat(formData.weight)
    const height = parseFloat(formData.height)
    const heightFeet = parseFloat(formData.heightFeet)
    const heightInches = parseFloat(formData.heightInches)

    const inputs: Partial<BMIInputs> = {
      weight: isNaN(weight) ? undefined : weight,
      height: isNaN(height) ? undefined : height,
      heightFeet: isNaN(heightFeet) ? undefined : heightFeet,
      heightInches: isNaN(heightInches) ? undefined : heightInches,
      unit: formData.unit
    }

    const validationErrors = validateBMIInputs(inputs)
    setErrors(validationErrors)

    if (validationErrors.length === 0 && inputs.weight) {
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
      }, 100)

      setTimeout(() => {
        try {
          const newResult = calculateBMIResult(inputs as BMIInputs)
          setResult(newResult)
          setIsCalculating(false)
          setCalculationProgress(0)
          
          // Show success toast
          addToast({
            type: 'success',
            message: `BMI calculated: ${newResult.bmi.toFixed(1)} (${newResult.category})`,
            duration: 3000
          })
        } catch (error) {
          setIsCalculating(false)
          setCalculationProgress(0)
          const errorMessage = error instanceof Error ? error.message : 'Calculation failed'
          setErrors([errorMessage])
          addToast({
            type: 'error',
            message: errorMessage,
            duration: 5000
          })
        }
      }, 600)
    } else {
      setResult(null)
    }
  }, [formData, addToast])

  // Debounced calculation
  useEffect(() => {
    const timer = setTimeout(calculateBMI, 300)
    return () => clearTimeout(timer)
  }, [calculateBMI])

  const handleInputChange = (field: keyof BMIFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const resetForm = () => {
    setFormData({
      weight: '',
      height: '',
      heightFeet: '',
      heightInches: '',
      unit: 'metric'
    })
    setResult(null)
    setErrors([])
  }

  const getBMIColorClass = (bmi: number) => {
    if (bmi < 18.5) return 'text-blue-500'
    if (bmi < 25) return 'text-green-500'
    if (bmi < 30) return 'text-yellow-500'
    return 'text-red-500'
  }

  const getHealthTips = (category: string) => {
    const tips = {
      'Underweight': [
        'Eat nutrient-dense foods',
        'Include healthy fats in your diet',
        'Consider consulting a nutritionist'
      ],
      'Normal weight': [
        'Maintain regular physical activity',
        'Keep a balanced diet',
        'Stay hydrated'
      ],
      'Overweight': [
        'Increase physical activity',
        'Reduce portion sizes',
        'Focus on whole foods'
      ],
      'Obese': [
        'Consult with healthcare professionals',
        'Start with low-impact exercises',
        'Consider a structured weight loss plan'
      ]
    }
    return tips[category as keyof typeof tips] || []
  }

  return (
    <div className="space-y-8">
      <StaggerContainer className="space-y-8">
        {/* Header */}
        <motion.div className="text-center space-y-4">
          <FloatingElement direction="circular" duration={4}>
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full">
              <Scale className="w-8 h-8 text-primary" />
            </div>
          </FloatingElement>
          <div>
            <h1 className="text-3xl font-bold text-foreground">BMI Calculator</h1>
            <p className="text-muted-foreground">Calculate your Body Mass Index with real-time visualization</p>
          </div>
        </motion.div>

        {/* Calculator Form */}
        <AnimatedCard className="max-w-2xl mx-auto" glowEffect>
          <AnimatedCardHeader>
            <AnimatedCardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Body Measurements
            </AnimatedCardTitle>
          </AnimatedCardHeader>
          <AnimatedCardContent>
            <Tabs value={formData.unit} onValueChange={(value) => handleInputChange('unit', value)}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="metric" animated>Metric (kg/cm)</TabsTrigger>
                <TabsTrigger value="imperial" animated>Imperial (lbs/ft)</TabsTrigger>
              </TabsList>

              <TabsContent value="metric" animated className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <AnimatedInput
                    label="Weight"
                    value={formData.weight}
                    onChange={(e) => handleInputChange('weight', e.target.value)}
                    placeholder="Enter weight in kg"
                    type="number"
                    min="0"
                    step="0.1"
                    leftIcon={<Scale className="w-4 h-4" />}
                    error={errors.find(e => e.includes('weight'))}
                    floatingLabel
                    animated
                  />
                  
                  <AnimatedInput
                    label="Height"
                    value={formData.height}
                    onChange={(e) => handleInputChange('height', e.target.value)}
                    placeholder="Enter height in cm"
                    type="number"
                    min="0"
                    step="0.1"
                    leftIcon={<Ruler className="w-4 h-4" />}
                    error={errors.find(e => e.includes('height'))}
                    floatingLabel
                    animated
                  />
                </div>
              </TabsContent>

              <TabsContent value="imperial" animated className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <AnimatedInput
                    label="Weight"
                    value={formData.weight}
                    onChange={(e) => handleInputChange('weight', e.target.value)}
                    placeholder="Weight in lbs"
                    type="number"
                    min="0"
                    step="0.1"
                    leftIcon={<Scale className="w-4 h-4" />}
                    error={errors.find(e => e.includes('weight'))}
                    floatingLabel
                    animated
                  />
                  
                  <AnimatedInput
                    label="Height (feet)"
                    value={formData.heightFeet}
                    onChange={(e) => handleInputChange('heightFeet', e.target.value)}
                    placeholder="Feet"
                    type="number"
                    min="0"
                    max="8"
                    leftIcon={<Ruler className="w-4 h-4" />}
                    error={errors.find(e => e.includes('height'))}
                    floatingLabel
                    animated
                  />
                  
                  <AnimatedInput
                    label="Height (inches)"
                    value={formData.heightInches}
                    onChange={(e) => handleInputChange('heightInches', e.target.value)}
                    placeholder="Inches"
                    type="number"
                    min="0"
                    max="11"
                    step="0.1"
                    error={errors.find(e => e.includes('height'))}
                    floatingLabel
                    animated
                  />
                </div>
              </TabsContent>
            </Tabs>

            {/* Calculation Progress */}
            {isCalculating && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2"
              >
                <div className="flex items-center justify-between text-sm">
                  <span>Calculating BMI...</span>
                  <span>{calculationProgress}%</span>
                </div>
                <Progress value={calculationProgress} animated />
              </motion.div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button 
                onClick={calculateBMI} 
                disabled={isCalculating}
                className="flex-1"
              >
                {isCalculating ? 'Calculating...' : 'Calculate BMI'}
              </Button>
              <Button variant="outline" onClick={resetForm}>
                Reset
              </Button>
            </div>
          </AnimatedCardContent>
        </AnimatedCard>

        {/* Results */}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* BMI Result Card */}
            <AnimatedCard className="max-w-2xl mx-auto text-center" glowEffect>
              <AnimatedCardContent className="pt-6">
                <div className="space-y-4">
                  <FloatingElement direction="up" amplitude={5}>
                    <div className={cn("text-6xl font-bold", getBMIColorClass(result.bmi))}>
                      {result.bmi.toFixed(1)}
                    </div>
                  </FloatingElement>
                  <div>
                    <div className="text-xl font-semibold">{result.category}</div>
                    <div className="text-sm text-muted-foreground">{result.category}</div>
                  </div>
                  
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Heart className="w-4 h-4" />
                    <span>Healthy BMI range: 18.5 - 24.9</span>
                  </div>
                </div>
              </AnimatedCardContent>
            </AnimatedCard>

            {/* Visualization */}
            <BMIVisualization 
              bmi={result.bmi} 
              category={result.category}
              className="max-w-4xl mx-auto"
            />

            {/* Health Tips */}
            <AnimatedCard className="max-w-2xl mx-auto">
              <AnimatedCardHeader>
                <AnimatedCardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5" />
                  Health Recommendations
                </AnimatedCardTitle>
              </AnimatedCardHeader>
              <AnimatedCardContent>
                <ul className="space-y-2">
                  {getHealthTips(result.category).map((tip, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-2 text-sm"
                    >
                      <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                      {tip}
                    </motion.li>
                  ))}
                </ul>
              </AnimatedCardContent>
            </AnimatedCard>
          </motion.div>
        )}
      </StaggerContainer>
    </div>
  )
}
