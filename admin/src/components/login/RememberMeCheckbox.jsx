"use client"

import { Check } from "lucide-react"

const RememberMeCheckbox = ({ checked, onChange, disabled = false }) => {
  return (
    <label className="flex items-center cursor-pointer group select-none">
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          className="sr-only"
        />
        <div
          className={`w-5 h-5 rounded border-2 mr-3 flex items-center justify-center transition-all duration-300 transform group-hover:scale-110 ${
            checked
              ? "bg-gradient-to-r from-yellow-400 to-amber-500 border-yellow-400 shadow-lg shadow-yellow-500/25"
              : "border-gray-600 group-hover:border-yellow-500/50 bg-gray-900/50"
          } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {checked && <Check className="w-3 h-3 text-black font-bold animate-bounce" strokeWidth={3} />}
        </div>

        {/* Glow Effect */}
        {checked && <div className="absolute inset-0 rounded bg-yellow-400/20 blur-sm animate-pulse"></div>}
      </div>

      <span
        className={`text-sm font-medium transition-colors duration-200 ${
          checked ? "text-yellow-400" : "text-gray-300 group-hover:text-yellow-400"
        } ${disabled ? "opacity-50" : ""}`}
      >
        Ghi nhớ đăng nhập
      </span>
    </label>
  )
}

export default RememberMeCheckbox
