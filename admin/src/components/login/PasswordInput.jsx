"use client"

import { Lock, Eye, EyeOff } from "lucide-react"

const PasswordInput = ({ value, onChange, showPassword, toggleVisibility, disabled = false }) => {
  return (
    <div className="space-y-2">
      <label htmlFor="password" className="block text-sm font-semibold text-yellow-400 flex items-center">
        <Lock className="w-4 h-4 mr-2" />
        Mật khẩu
      </label>
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Lock className="h-5 w-5 text-gray-400 group-hover:text-yellow-400 transition-colors duration-200" />
        </div>
        <input
          id="password"
          name="password"
          type={showPassword ? "text" : "password"}
          autoComplete="current-password"
          required
          value={value}
          onChange={onChange}
          disabled={disabled}
          className="w-full pl-12 pr-12 py-4 bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500/50 transition-all duration-300 group-hover:border-yellow-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
          placeholder="••••••••••"
        />
        <button
          type="button"
          className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-yellow-400 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={toggleVisibility}
          disabled={disabled}
        >
          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-yellow-500/5 to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

        {/* Focus Ring */}
        <div className="absolute inset-0 rounded-xl ring-2 ring-yellow-500/0 group-focus-within:ring-yellow-500/20 transition-all duration-300"></div>
      </div>
    </div>
  )
}

export default PasswordInput
