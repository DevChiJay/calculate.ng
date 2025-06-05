"use client"

import * as React from "react"
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"
import { cn } from "@/lib/utils"

interface AnimatedCardProps {
  children: React.ReactNode
  className?: string
  hover3d?: boolean
  glowEffect?: boolean
  springAnimation?: boolean
  delay?: number
}

export function AnimatedCard({
  children,
  className,
  hover3d = false,
  glowEffect = false,
  springAnimation = true,
  delay = 0
}: AnimatedCardProps) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  
  const mouseXSpring = useSpring(x)
  const mouseYSpring = useSpring(y)
  
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["7.5deg", "-7.5deg"])
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-7.5deg", "7.5deg"])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!hover3d) return
    
    const rect = e.currentTarget.getBoundingClientRect()
    const width = rect.width
    const height = rect.height
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    
    const xPct = mouseX / width - 0.5
    const yPct = mouseY / height - 0.5
    
    x.set(xPct)
    y.set(yPct)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      initial={springAnimation ? { opacity: 0, y: 20, scale: 0.9 } : {}}
      animate={springAnimation ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{
        duration: 0.5,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      whileHover={springAnimation ? { scale: 1.02 } : {}}
      style={hover3d ? {
        rotateX,
        rotateY,
        transformStyle: "preserve-3d"
      } : {}}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "rounded-lg border bg-card text-card-foreground shadow-sm transition-all duration-300",
        glowEffect && "hover:shadow-2xl hover:shadow-primary/25",
        hover3d && "transform-gpu",
        className
      )}
    >
      <div style={hover3d ? { transform: "translateZ(50px)" } : {}}>
        {children}
      </div>
    </motion.div>
  )
}

export function AnimatedCardHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex flex-col space-y-1.5 p-6", className)} {...props}>
      {children}
    </div>
  )
}

export function AnimatedCardTitle({
  className,
  children,
  animated = true,
  ...props
}: Omit<React.HTMLAttributes<HTMLHeadingElement>, 'onDrag' | 'onDragEnd' | 'onDragStart' | 'onAnimationStart' | 'onAnimationEnd' | 'onTransitionEnd'> & { animated?: boolean }) {
  return (
    <motion.h3
      initial={animated ? { opacity: 0, x: -20 } : {}}
      animate={animated ? { opacity: 1, x: 0 } : {}}
      transition={{ delay: 0.2, duration: 0.4 }}
      className={cn(
        "text-2xl font-semibold leading-none tracking-tight",
        className
      )}
      {...props}
    >
      {children}
    </motion.h3>
  )
}

export function AnimatedCardDescription({
  className,
  children,
  animated = true,
  ...props
}: Omit<React.HTMLAttributes<HTMLParagraphElement>, 'onDrag' | 'onDragEnd' | 'onDragStart' | 'onAnimationStart' | 'onAnimationEnd' | 'onTransitionEnd'> & { animated?: boolean }) {
  return (
    <motion.p
      initial={animated ? { opacity: 0, x: -20 } : {}}
      animate={animated ? { opacity: 1, x: 0 } : {}}
      transition={{ delay: 0.3, duration: 0.4 }}
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    >
      {children}
    </motion.p>
  )
}

export function AnimatedCardContent({
  className,
  children,
  animated = true,
  ...props
}: Omit<React.HTMLAttributes<HTMLDivElement>, 'onDrag' | 'onDragEnd' | 'onDragStart' | 'onAnimationStart' | 'onAnimationEnd' | 'onTransitionEnd'> & { animated?: boolean }) {
  return (
    <motion.div
      initial={animated ? { opacity: 0, y: 20 } : {}}
      animate={animated ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: 0.4, duration: 0.4 }}
      className={cn("p-6 pt-0", className)}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export function AnimatedCardFooter({
  className,
  children,
  animated = true,
  ...props
}: Omit<React.HTMLAttributes<HTMLDivElement>, 'onDrag' | 'onDragEnd' | 'onDragStart' | 'onAnimationStart' | 'onAnimationEnd' | 'onTransitionEnd'> & { animated?: boolean }) {
  return (
    <motion.div
      initial={animated ? { opacity: 0, y: 20 } : {}}
      animate={animated ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: 0.5, duration: 0.4 }}
      className={cn("flex items-center p-6 pt-0", className)}
      {...props}
    >
      {children}
    </motion.div>
  )
}
