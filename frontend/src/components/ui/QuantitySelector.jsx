"use client"

import { motion } from "framer-motion"
import { Plus, Minus } from "lucide-react"

const QuantitySelector = ({ value, onChange, min = 1, max = 99, size = "md", className = "" }) => {
  const sizes = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
  }

  const handleDecrease = () => {
    if (value > min) {
      onChange(value - 1)
    }
  }

  const handleIncrease = () => {
    if (value < max) {
      onChange(value + 1)
    }
  }

  return (
    <div className={`flex items-center bg-slate-700/50 rounded-xl border border-slate-600 ${className}`}>
      <motion.button
        onClick={handleDecrease}
        disabled={value <= min}
        className={`${sizes[size]} flex items-center justify-center text-white hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
        whileHover={{ scale: value > min ? 1.1 : 1 }}
        whileTap={{ scale: value > min ? 0.9 : 1 }}
      >
        <Minus size={16} />
      </motion.button>

      <div className={`${sizes[size]} flex items-center justify-center text-white font-semibold min-w-[40px]`}>
        {value}
      </div>

      <motion.button
        onClick={handleIncrease}
        disabled={value >= max}
        className={`${sizes[size]} flex items-center justify-center text-white hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
        whileHover={{ scale: value < max ? 1.1 : 1 }}
        whileTap={{ scale: value < max ? 0.9 : 1 }}
      >
        <Plus size={16} />
      </motion.button>
    </div>
  )
}

export default QuantitySelector
