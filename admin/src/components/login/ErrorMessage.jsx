"use client"

import { AlertTriangle, X } from "lucide-react"
import { useState } from "react"

const ErrorMessage = ({ message }) => {
  const [isVisible, setIsVisible] = useState(true)

  if (!message || !isVisible) return null

  return (
    <div className="mb-6 relative">
      <div className="bg-red-900/30 backdrop-blur-sm border border-red-500/30 text-red-300 px-4 py-4 rounded-xl relative overflow-hidden animate-slide-in">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 via-red-600/5 to-transparent"></div>

        {/* Animated Border */}
        <div className="absolute inset-0 rounded-xl border border-red-500/50 animate-pulse"></div>

        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 mr-3 text-red-400 animate-pulse" />
            <p className="font-medium">{message}</p>
          </div>

          <button
            onClick={() => setIsVisible(false)}
            className="ml-4 text-red-400 hover:text-red-300 transition-colors duration-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="absolute bottom-0 left-0 h-1 bg-red-500/50 animate-pulse"></div>
      </div>
    </div>
  )
}

export default ErrorMessage
