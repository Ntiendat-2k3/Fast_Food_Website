"use client"

/**
 * ForgotPasswordLink component for the login form
 *
 * @returns {JSX.Element} The rendered component
 */
import { HelpCircle, ArrowRight } from "lucide-react"

const ForgotPasswordLink = ({ disabled = false }) => {
  const handleClick = () => {
    // TODO: Implement forgot password functionality
    alert("Tính năng quên mật khẩu sẽ được triển khai sớm!")
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className={`group flex items-center text-sm font-medium transition-all duration-200 ${
        disabled ? "text-gray-500 cursor-not-allowed" : "text-yellow-400 hover:text-amber-400 hover:underline"
      }`}
    >
      <HelpCircle className="w-4 h-4 mr-1 group-hover:rotate-12 transition-transform duration-200" />
      <span>Quên mật khẩu?</span>
      <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform duration-200" />
    </button>
  )
}

export default ForgotPasswordLink
