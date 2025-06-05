"use client"

import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import AnimatedChart, { ChartData, chartThemes } from '@/components/ui/animated-chart'
import { AnimatedCard, AnimatedCardContent, AnimatedCardHeader, AnimatedCardTitle } from '@/components/ui/animated-card'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

interface BMIVisualizationProps {
  bmi: number
  category: string
  className?: string
}

export function BMIVisualization({ bmi, category, className }: BMIVisualizationProps) {
  const bmiCategories = [
    { name: 'Underweight', min: 0, max: 18.5, color: 'rgb(59, 130, 246)' },
    { name: 'Normal', min: 18.5, max: 25, color: 'rgb(16, 185, 129)' },
    { name: 'Overweight', min: 25, max: 30, color: 'rgb(251, 146, 60)' },
    { name: 'Obese', min: 30, max: 50, color: 'rgb(248, 113, 113)' }
  ]

  const chartData: ChartData = {
    labels: bmiCategories.map(cat => cat.name),
    datasets: [{
      label: 'BMI Categories',
      data: bmiCategories.map(cat => cat.max - cat.min),
      backgroundColor: bmiCategories.map(cat => cat.color + '30'),
      borderColor: bmiCategories.map(cat => cat.color),
      borderWidth: 2
    }]
  }

  const currentCategoryIndex = bmiCategories.findIndex(cat => 
    bmi >= cat.min && bmi < cat.max
  )

  return (
    <AnimatedCard className={cn("w-full", className)} glowEffect>
      <AnimatedCardHeader>
        <AnimatedCardTitle>BMI Analysis</AnimatedCardTitle>
      </AnimatedCardHeader>
      <AnimatedCardContent>
        <div className="space-y-6">
          {/* BMI Gauge */}
          <div className="relative">
            <motion.div
              className="text-center mb-4"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
            >
              <div className="text-4xl font-bold text-primary">{bmi.toFixed(1)}</div>
              <div className="text-sm text-muted-foreground">{category}</div>
            </motion.div>
            
            {/* Progress bars for each category */}
            <div className="space-y-3">
              {bmiCategories.map((cat, index) => (
                <motion.div
                  key={cat.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="space-y-1"
                >
                  <div className="flex justify-between text-sm">
                    <span className={cn(
                      "font-medium",
                      index === currentCategoryIndex && "text-primary"
                    )}>
                      {cat.name}
                    </span>
                    <span className="text-muted-foreground">
                      {cat.min} - {cat.max}
                    </span>
                  </div>
                  <Progress
                    value={index === currentCategoryIndex ? 
                      ((bmi - cat.min) / (cat.max - cat.min)) * 100 : 0
                    }
                    color={index === currentCategoryIndex ? "default" : "default"}
                    animated
                  />
                </motion.div>
              ))}
            </div>
          </div>

          {/* Chart */}
          <AnimatedChart
            type="doughnut"
            data={chartData}
            options={{
              plugins: {
                legend: {
                  position: 'bottom'
                }
              }
            }}
            height={200}
          />
        </div>
      </AnimatedCardContent>
    </AnimatedCard>
  )
}

interface InflationVisualizationProps {
  data: {
    year: number
    cpi: number
    inflationRate: number
  }[]
  className?: string
}

export function InflationVisualization({ data, className }: InflationVisualizationProps) {
  const chartData: ChartData = useMemo(() => ({
    labels: data.map(d => d.year.toString()),
    datasets: [
      {
        label: 'CPI',
        data: data.map(d => d.cpi),
        backgroundColor: chartThemes.sunset.backgroundColor[0],
        borderColor: chartThemes.sunset.borderColor[0],
        borderWidth: 2,
        fill: true
      },
      {
        label: 'Inflation Rate (%)',
        data: data.map(d => d.inflationRate),
        backgroundColor: chartThemes.sunset.backgroundColor[1],
        borderColor: chartThemes.sunset.borderColor[1],
        borderWidth: 2,
        fill: false
      }
    ]
  }), [data])

  const averageInflation = useMemo(() => 
    data.reduce((sum, d) => sum + d.inflationRate, 0) / data.length
  , [data])

  return (
    <AnimatedCard className={cn("w-full", className)} glowEffect>
      <AnimatedCardHeader>
        <AnimatedCardTitle>Inflation Trends</AnimatedCardTitle>
      </AnimatedCardHeader>
      <AnimatedCardContent>
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center p-4 bg-muted rounded-lg"
            >
              <div className="text-2xl font-bold text-primary">
                {data[data.length - 1]?.inflationRate.toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground">Current Rate</div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center p-4 bg-muted rounded-lg"
            >
              <div className="text-2xl font-bold text-primary">
                {averageInflation.toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground">Average</div>
            </motion.div>
          </div>

          {/* Line Chart */}
          <AnimatedChart
            type="line"
            data={chartData}
            options={{
              scales: {
                y: {
                  title: {
                    display: true,
                    text: 'Value'
                  }
                }
              }
            }}
            height={300}
          />
        </div>
      </AnimatedCardContent>
    </AnimatedCard>
  )
}

interface TaxVisualizationProps {
  grossSalary: number
  netSalary: number
  totalTax: number
  taxBreakdown: {
    label: string
    amount: number
    color: string
  }[]
  className?: string
}

export function TaxVisualization({
  grossSalary,
  netSalary,
  totalTax,
  taxBreakdown,
  className
}: TaxVisualizationProps) {
  const chartData: ChartData = {
    labels: [...taxBreakdown.map(t => t.label), 'Net Salary'],
    datasets: [{
      label: 'Tax Breakdown',
      data: [...taxBreakdown.map(t => t.amount), netSalary],
      backgroundColor: [
        ...taxBreakdown.map(t => t.color + '80'),
        chartThemes.royal.backgroundColor[1]
      ],
      borderColor: [
        ...taxBreakdown.map(t => t.color),
        chartThemes.royal.borderColor[1]
      ],
      borderWidth: 2
    }]
  }

  const taxRate = (totalTax / grossSalary) * 100

  return (
    <AnimatedCard className={cn("w-full", className)} glowEffect>
      <AnimatedCardHeader>
        <AnimatedCardTitle>Tax Breakdown</AnimatedCardTitle>
      </AnimatedCardHeader>
      <AnimatedCardContent>
        <div className="space-y-6">
          {/* Summary */}
          <div className="grid grid-cols-3 gap-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="text-center p-4 bg-muted rounded-lg"
            >
              <div className="text-lg font-bold text-primary">
                ₦{grossSalary.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">Gross</div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="text-center p-4 bg-muted rounded-lg"
            >
              <div className="text-lg font-bold text-red-500">
                ₦{totalTax.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">Tax ({taxRate.toFixed(1)}%)</div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="text-center p-4 bg-muted rounded-lg"
            >
              <div className="text-lg font-bold text-green-500">
                ₦{netSalary.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">Net</div>
            </motion.div>
          </div>

          {/* Progress Visualization */}
          <div className="space-y-3">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="space-y-1"
            >
              <div className="flex justify-between text-sm">
                <span>Take-home Pay</span>
                <span className="text-green-500">
                  {((netSalary / grossSalary) * 100).toFixed(1)}%
                </span>
              </div>
              <Progress
                value={(netSalary / grossSalary) * 100}
                color="success"
                animated
              />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="space-y-1"
            >
              <div className="flex justify-between text-sm">
                <span>Total Tax</span>
                <span className="text-red-500">
                  {taxRate.toFixed(1)}%
                </span>
              </div>
              <Progress
                value={taxRate}
                color="danger"
                animated
              />
            </motion.div>
          </div>

          {/* Pie Chart */}
          <AnimatedChart
            type="pie"
            data={chartData}
            options={{
              plugins: {
                legend: {
                  position: 'bottom'
                }
              }
            }}
            height={250}
          />
        </div>
      </AnimatedCardContent>
    </AnimatedCard>
  )
}
