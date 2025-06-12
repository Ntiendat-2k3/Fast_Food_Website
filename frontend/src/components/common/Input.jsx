"use client"

import { forwardRef, useState } from "react"
import { Eye, EyeOff, AlertCircle } from "lucide-react"

const Input = forwardRef(
  (
    {
      label,
      error,
      icon,
      type = "text",
      placeholder,
      className = "",
      containerClassName = "",
      required = false,
      ...props
    },
    ref,
  ) => {
    const [showPassword, setShowPassword] = useState(false)
    const [focused, setFocused] = useState(false)

    const inputType = type === "password" && showPassword ? "text" : type

    const baseClasses = `w-full bg-slate-700/50 text-white border rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 ${
      icon ? "pl-10" : ""
    } ${type === "password" ? "pr-10" : ""} ${error ? "border-red-500" : "border-slate-600"}`

    return (
      <div className={`space-y-2 ${containerClassName}`}>
        {label && (
          <label className="block text-sm font-medium text-gray-300">
            {label}
            {required && <span className="text-red-400 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          {icon && <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">{icon}</div>}

          <input
            ref={ref}
            type={inputType}
            placeholder={placeholder}
            className={`${baseClasses} ${className}`}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            {...props}
          />

          {type === "password" && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          )}
        </div>

        {error && (
          <div className="text-red-400 text-sm flex items-center">
            <AlertCircle size={14} className="mr-1" />
            {error}
          </div>
        )}
      </div>
    )
  },
)

Input.displayName = "Input"

export default Input
