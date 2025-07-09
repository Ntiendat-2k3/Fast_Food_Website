"use client"

/**
 * EmailInput component for the login form
 *
 * @param {Object} props - Component props
 * @param {string} props.value - Current email value
 * @param {Function} props.onChange - Function to call when email changes
 * @returns {JSX.Element} The rendered component
 */
const EmailInput = ({ value, onChange }) => {
  return (
    <div>
      <label htmlFor="email" className="block text-sm font-medium text-gray-300">
        Email
      </label>
      <input
        id="email"
        name="email"
        type="email"
        autoComplete="email"
        required
        value={value}
        onChange={onChange}
        className="mt-1 block w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        placeholder="Nhập email của bạn"
      />
    </div>
  )
}

export default EmailInput
