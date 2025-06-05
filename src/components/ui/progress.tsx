"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> & {
    animated?: boolean
    showValue?: boolean
    color?: "default" | "success" | "warning" | "danger"
  }
>(({ className, value, animated = true, showValue = false, color = "default", ...props }, ref) => {
  const colorClasses = {
    default: "bg-primary",
    success: "bg-green-500",
    warning: "bg-yellow-500",
    danger: "bg-red-500",
  }

  return (
    <div className="relative">
      <ProgressPrimitive.Root
        ref={ref}
        className={cn(
          "relative h-4 w-full overflow-hidden rounded-full bg-secondary",
          className
        )}
        {...props}
      >
        <ProgressPrimitive.Indicator
          asChild
          className={cn("h-full w-full flex-1 transition-all", colorClasses[color])}
          style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
        >
          {animated ? (
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${value || 0}%` }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="h-full rounded-full"
            />
          ) : (
            <div className="h-full rounded-full" />
          )}
        </ProgressPrimitive.Indicator>
      </ProgressPrimitive.Root>
      {showValue && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 flex items-center justify-center text-xs font-medium text-primary-foreground"
        >
          {Math.round(value || 0)}%
        </motion.div>
      )}
    </div>
  )
})
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
