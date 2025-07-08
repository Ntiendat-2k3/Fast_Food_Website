"use client"

import { Mail } from "lucide-react"

const EmailInput = ({ email, setEmail, disabled }) => {
  return (
    <div>
      <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
        Email
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Mail size={20} className="text-gray-400" />
        </div>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={disabled}
          className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
          placeholder="Nhập email của bạn"
          required
        />
      </div>
    </div>
  )
}

export default EmailInput
