"use client"

import { motion } from "framer-motion"
import { forwardRef } from "react"

const Button = forwardRef(
  (
    {
      children,
      variant = "primary",
      size = "md",
      disabled = false,
      loading = false,
      icon,
      iconPosition = "left",
      className = "",
      onClick,
      type = "button",
      ...props
    },
    ref,
  ) => {
    const baseClasses =
      "inline-flex items-center justify-center font-medium transition-all duration-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"

    const variants = {
      primary:
        "bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-slate-900 focus:ring-primary",
      secondary: "border-2 border-primary text-primary hover:bg-primary hover:text-slate-900 focus:ring-primary",
      outline: "border border-slate-600 text-white hover:bg-slate-700 focus:ring-slate-500",
      ghost: "text-white hover:bg-slate-700/50 focus:ring-slate-500",
      danger: "bg-red-500 hover:bg-red-600 text-white focus:ring-red-500",
      success: "bg-green-500 hover:bg-green-600 text-white focus:ring-green-500",
    }

    const sizes = {
      sm: "px-3 py-2 text-sm min-h-[36px]",
      md: "px-4 py-3 text-base min-h-[44px]",
      lg: "px-6 py-4 text-lg min-h-[52px]",
    }

    const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`

    const content = (
      <>
        {loading && (
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2" />
        )}
        {icon && iconPosition === "left" && !loading && <span className="mr-2">{icon}</span>}
        {children}
        {icon && iconPosition === "right" && !loading && <span className="ml-2">{icon}</span>}
      </>
    )

    return (
      <motion.button
        ref={ref}
        type={type}
        disabled={disabled || loading}
        onClick={onClick}
        className={classes}
        whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
        whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
        {...props}
      >
        {content}
      </motion.button>
    )
  },
)

Button.displayName = "Button"

export default Button
