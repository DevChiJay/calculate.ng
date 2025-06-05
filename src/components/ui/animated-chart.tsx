"use client"

import React from 'react'
import { Line, Bar, Doughnut, Pie } from 'react-chartjs-2'
import { motion } from 'framer-motion'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions as ChartJSOptions
} from 'chart.js'
import { cn } from '@/lib/utils'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

export interface ChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    backgroundColor?: string | string[]
    borderColor?: string | string[]
    borderWidth?: number
    fill?: boolean
  }[]
}

interface AnimatedChartProps {
  type: 'line' | 'bar' | 'doughnut' | 'pie'
  data: ChartData
  options?: Record<string, unknown>
  className?: string
  animated?: boolean
  height?: number
}

export default function AnimatedChart({
  type,
  data,
  options = {},
  className,
  animated = true,
  height = 400
}: AnimatedChartProps) {
  const defaultOptions: Record<string, unknown> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top'
      }
    },    animation: {
      duration: animated ? 1000 : 0,
      easing: 'easeInOutQuart'
    },
    ...options
  }

  const renderChart = () => {
    switch (type) {
      case 'line':
        return <Line data={data} options={defaultOptions as ChartJSOptions<'line'>} />
      case 'bar':
        return <Bar data={data} options={defaultOptions as ChartJSOptions<'bar'>} />
      case 'doughnut':
        return <Doughnut data={data} options={defaultOptions as ChartJSOptions<'doughnut'>} />
      case 'pie':
        return <Pie data={data} options={defaultOptions as ChartJSOptions<'pie'>} />
      default:
        return <Line data={data} options={defaultOptions as ChartJSOptions<'line'>} />
    }
  }

  return (
    <motion.div
      initial={animated ? { opacity: 0, scale: 0.9 } : {}}
      animate={animated ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={cn("w-full", className)}
      style={{ height }}
    >
      {renderChart()}
    </motion.div>
  )
}

// Predefined chart themes
export const chartThemes = {
  ocean: {
    backgroundColor: [
      'rgba(59, 130, 246, 0.1)',
      'rgba(16, 185, 129, 0.1)',
      'rgba(6, 182, 212, 0.1)',
      'rgba(139, 92, 246, 0.1)',
    ],
    borderColor: [
      'rgb(59, 130, 246)',
      'rgb(16, 185, 129)',
      'rgb(6, 182, 212)',
      'rgb(139, 92, 246)',
    ],
  },
  sunset: {
    backgroundColor: [
      'rgba(251, 146, 60, 0.1)',
      'rgba(248, 113, 113, 0.1)',
      'rgba(252, 211, 77, 0.1)',
      'rgba(245, 101, 101, 0.1)',
    ],
    borderColor: [
      'rgb(251, 146, 60)',
      'rgb(248, 113, 113)',
      'rgb(252, 211, 77)',
      'rgb(245, 101, 101)',
    ],
  },
  royal: {
    backgroundColor: [
      'rgba(139, 92, 246, 0.1)',
      'rgba(251, 191, 36, 0.1)',
      'rgba(168, 85, 247, 0.1)',
      'rgba(245, 158, 11, 0.1)',
    ],
    borderColor: [
      'rgb(139, 92, 246)',
      'rgb(251, 191, 36)',
      'rgb(168, 85, 247)',
      'rgb(245, 158, 11)',
    ],
  },
}
