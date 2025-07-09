"use client"

import { Mail, User } from "lucide-react"

const EmailInput = ({ value, onChange, disabled = false }) => {
  return (
    <div className="space-y-2">
      <label htmlFor="email" className="block text-sm font-semibold text-yellow-400 flex items-center">
        <Mail className="w-4 h-4 mr-2" />
        Email Address
      </label>
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <User className="h-5 w-5 text-gray-400 group-hover:text-yellow-400 transition-colors duration-200" />
        </div>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={value}
          onChange={onChange}
          disabled={disabled}
          className="w-full pl-12 pr-4 py-4 bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500/50 transition-all duration-300 group-hover:border-yellow-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
          placeholder="admin@example.com"
        />
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-yellow-500/5 to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

        {/* Focus Ring */}
        <div className="absolute inset-0 rounded-xl ring-2 ring-yellow-500/0 group-focus-within:ring-yellow-500/20 transition-all duration-300"></div>
      </div>
    </div>
  )
}

export default EmailInput
