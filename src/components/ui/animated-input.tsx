"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { CheckCircle, AlertCircle, Eye, EyeOff } from "lucide-react"

export interface AnimatedInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onAnimationStart' | 'onAnimationEnd' | 'onTransitionEnd' | 'onDrag' | 'onDragEnd' | 'onDragStart'> {
  label?: string
  error?: string
  success?: string
  animated?: boolean
  floatingLabel?: boolean
  showPasswordToggle?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const AnimatedInput = React.forwardRef<HTMLInputElement, AnimatedInputProps>(
  ({
    className,
    type,
    label,
    error,
    success,
    animated = true,
    floatingLabel = false,
    showPasswordToggle = false,
    leftIcon,
    rightIcon,
    ...props
  }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false)
    const [showPassword, setShowPassword] = React.useState(false)
    const [hasValue, setHasValue] = React.useState(false)

    const inputType = showPasswordToggle && showPassword ? 'text' : type

    const handleFocus = () => setIsFocused(true)
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false)
      setHasValue(e.target.value.length > 0)
    }

    const togglePasswordVisibility = () => setShowPassword(!showPassword)

    const labelVariants = {
      default: {
        top: floatingLabel ? "50%" : "0%",
        left: leftIcon ? "2.5rem" : "0.75rem",
        fontSize: "0.875rem",
        color: "rgb(107 114 128)",
        y: floatingLabel ? "-50%" : "0%"
      },
      focused: {
        top: "0%",
        left: "0.75rem",
        fontSize: "0.75rem",
        color: "rgb(59 130 246)",
        y: "-50%"
      }
    }

    return (
      <div className="relative">
        {label && !floatingLabel && (
          <motion.label
            initial={animated ? { opacity: 0, y: -10 } : {}}
            animate={animated ? { opacity: 1, y: 0 } : {}}
            className="block text-sm font-medium text-foreground mb-2"
          >
            {label}
          </motion.label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground z-10">
              {leftIcon}
            </div>
          )}

          <motion.input
            ref={ref}
            type={inputType}
            className={cn(
              "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
              leftIcon && "pl-10",
              (rightIcon || showPasswordToggle || error || success) && "pr-10",
              error && "border-red-500 focus-visible:ring-red-500",
              success && "border-green-500 focus-visible:ring-green-500",
              className
            )}
            onFocus={handleFocus}
            onBlur={handleBlur}
            initial={animated ? { opacity: 0, scale: 0.95 } : {}}
            animate={animated ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.2 }}
            {...props}
          />

          {label && floatingLabel && (
            <motion.label
              className="absolute pointer-events-none transition-all duration-200 px-1 bg-background"
              variants={labelVariants}
              animate={isFocused || hasValue ? "focused" : "default"}
              transition={{ duration: 0.2 }}
            >
              {label}
            </motion.label>
          )}

          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
            {showPasswordToggle && type === 'password' && (
              <motion.button
                type="button"
                onClick={togglePasswordVisibility}
                className="text-muted-foreground hover:text-foreground transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </motion.button>
            )}

            {error && (
              <motion.div
                initial={animated ? { scale: 0, opacity: 0 } : {}}
                animate={animated ? { scale: 1, opacity: 1 } : {}}
                className="text-red-500"
              >
                <AlertCircle size={16} />
              </motion.div>
            )}

            {success && !error && (
              <motion.div
                initial={animated ? { scale: 0, opacity: 0 } : {}}
                animate={animated ? { scale: 1, opacity: 1 } : {}}
                className="text-green-500"
              >
                <CheckCircle size={16} />
              </motion.div>
            )}

            {rightIcon && !error && !success && !showPasswordToggle && (
              <div className="text-muted-foreground">
                {rightIcon}
              </div>
            )}
          </div>
        </div>

        <AnimatePresence>
          {error && (
            <motion.p
              initial={animated ? { opacity: 0, y: -10, height: 0 } : {}}
              animate={animated ? { opacity: 1, y: 0, height: "auto" } : {}}
              exit={animated ? { opacity: 0, y: -10, height: 0 } : {}}
              className="text-sm text-red-500 mt-1"
            >
              {error}
            </motion.p>
          )}

          {success && !error && (
            <motion.p
              initial={animated ? { opacity: 0, y: -10, height: 0 } : {}}
              animate={animated ? { opacity: 1, y: 0, height: "auto" } : {}}
              exit={animated ? { opacity: 0, y: -10, height: 0 } : {}}
              className="text-sm text-green-500 mt-1"
            >
              {success}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    )
  }
)

AnimatedInput.displayName = "AnimatedInput"

export { AnimatedInput }
