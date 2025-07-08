"use client"

const RememberMeCheckbox = ({ rememberMe, setRememberMe, disabled }) => {
  return (
    <div className="flex items-center">
      <input
        id="remember-me"
        type="checkbox"
        checked={rememberMe}
        onChange={(e) => setRememberMe(e.target.checked)}
        disabled={disabled}
        className="h-4 w-4 text-orange-500 bg-gray-700 border-gray-600 rounded focus:ring-orange-500 focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed"
      />
      <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300">
        Ghi nhớ đăng nhập
      </label>
    </div>
  )
}

export default RememberMeCheckbox
