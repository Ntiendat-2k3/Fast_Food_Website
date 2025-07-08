"use client"

import { useState } from "react"
import { Lock, Eye, EyeOff } from "lucide-react"

const PasswordInput = ({ password, setPassword, disabled }) => {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div>
      <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
        Mật khẩu
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Lock size={20} className="text-gray-400" />
        </div>
        <input
          id="password"
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={disabled}
          className="w-full pl-10 pr-12 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
          placeholder="Nhập mật khẩu"
          required
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          disabled={disabled}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>
    </div>
  )
}

export default PasswordInput
