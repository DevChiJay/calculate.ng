"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface FloatingElementProps {
  children: React.ReactNode
  className?: string
  delay?: number
  duration?: number
  amplitude?: number
  direction?: 'up' | 'down' | 'left' | 'right' | 'circular'
}

export function FloatingElement({
  children,
  className,
  delay = 0,
  duration = 3,
  amplitude = 10,
  direction = 'up'
}: FloatingElementProps) {
  const getAnimationProps = () => {
    switch (direction) {
      case 'up':
        return {
          y: [-amplitude, amplitude, -amplitude],
        }
      case 'down':
        return {
          y: [amplitude, -amplitude, amplitude],
        }
      case 'left':
        return {
          x: [-amplitude, amplitude, -amplitude],
        }
      case 'right':
        return {
          x: [amplitude, -amplitude, amplitude],
        }
      case 'circular':
        return {
          x: [0, amplitude, 0, -amplitude, 0],
          y: [0, amplitude, amplitude * 2, amplitude, 0],
        }
      default:
        return {
          y: [-amplitude, amplitude, -amplitude],
        }
    }
  }

  return (
    <motion.div
      className={cn("inline-block", className)}
      animate={getAnimationProps()}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      {children}
    </motion.div>
  )
}

interface ParallaxElementProps {
  children: React.ReactNode
  className?: string
  offset?: number
}

export function ParallaxElement({
  children,
  className,
  offset = 50
}: ParallaxElementProps) {
  return (
    <motion.div
      className={cn("relative", className)}
      initial={{ y: offset }}
      whileInView={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      viewport={{ once: true, margin: "-100px" }}
    >
      {children}
    </motion.div>
  )
}

interface StaggerContainerProps {
  children: React.ReactNode
  className?: string
  staggerDelay?: number
}

export function StaggerContainer({
  children,
  className,
  staggerDelay = 0.1
}: StaggerContainerProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay
          }
        }
      }}
    >
      {React.Children.map(children, (child, index) => (
        <motion.div
          key={index}
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 }
          }}
          transition={{ duration: 0.5 }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  )
}

interface MagneticElementProps {
  children: React.ReactNode
  className?: string
  strength?: number
}

export function MagneticElement({
  children,
  className,
  strength = 20
}: MagneticElementProps) {
  const [position, setPosition] = React.useState({ x: 0, y: 0 })

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    
    const deltaX = e.clientX - centerX
    const deltaY = e.clientY - centerY
    
    setPosition({
      x: deltaX * (strength / 100),
      y: deltaY * (strength / 100)
    })
  }

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 })
  }

  return (
    <motion.div
      className={cn("cursor-pointer", className)}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </motion.div>
  )
}

interface GlowEffectProps {
  children: React.ReactNode
  className?: string
  color?: string
  intensity?: number
}

export function GlowEffect({
  children,
  className,
  color = "rgb(59, 130, 246)",
  intensity = 0.5
}: GlowEffectProps) {
  return (
    <motion.div
      className={cn("relative", className)}
      whileHover={{
        filter: `drop-shadow(0 0 20px ${color}${Math.round(intensity * 255).toString(16).padStart(2, '0')})`
      }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  )
}
