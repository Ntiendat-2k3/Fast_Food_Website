"use client"
import { Eye, EyeOff } from "lucide-react"

/**
 * PasswordInput component with visibility toggle
 *
 * @param {Object} props - Component props
 * @param {string} props.value - Current password value
 * @param {Function} props.onChange - Function to call when password changes
 * @param {boolean} props.showPassword - Whether to show the password in plain text
 * @param {Function} props.toggleVisibility - Function to toggle password visibility
 * @returns {JSX.Element} The rendered component
 */
const PasswordInput = ({ value, onChange, showPassword, toggleVisibility }) => {
  return (
    <div>
      <label htmlFor="password" className="block text-sm font-medium text-gray-300">
        Mật khẩu
      </label>
      <div className="mt-1 relative">
        <input
          id="password"
          name="password"
          type={showPassword ? "text" : "password"}
          autoComplete="current-password"
          required
          value={value}
          onChange={onChange}
          className="block w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder="Nhập mật khẩu của bạn"
        />
        <button
          type="button"
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
          onClick={toggleVisibility}
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>
    </div>
  )
}

export default PasswordInput
