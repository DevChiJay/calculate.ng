"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
  variant?: "default" | "card" | "form" | "chart"
  count?: number
}

export function Skeleton({
  className,
  variant = "default",
  count = 1,
  ...props
}: SkeletonProps) {
  // Skeleton variants for different use cases
  const variants = {
    default: "h-4 w-full rounded-md bg-muted/50 animate-pulse",
    card: "w-full h-64 rounded-lg bg-muted/50 animate-pulse",
    form: "w-full space-y-4",
    chart: "h-60 w-full rounded-md bg-muted/50 animate-pulse"
  }

  const variantClass = variants[variant]

  if (variant === "form") {
    return (
      <div className={cn("w-full space-y-6", className)} {...props}>
        <div className="space-y-3">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-10" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-10" />
        </div>
        <div className="flex gap-4">
          <Skeleton className="h-10 w-28" />
          <Skeleton className="h-10 w-28" />
        </div>
      </div>
    )
  }

  return (
    <div className={cn("space-y-2", className)} {...props}>
      {Array(count)
        .fill(null)
        .map((_, index) => (
          <div key={index} className={cn(variantClass)} />
        ))}
    </div>
  )
}
