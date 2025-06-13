import { LogIn } from "lucide-react"

/**
 * LoginButton component with loading state
 *
 * @param {Object} props - Component props
 * @param {boolean} props.loading - Whether the login request is in progress
 * @returns {JSX.Element} The rendered component
 */
const LoginButton = ({ loading }) => {
  return (
    <button
      type="submit"
      disabled={loading}
      className="group relative w-full flex justify-center py-3 px-4 border border-transparent rounded-lg text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors disabled:opacity-70"
    >
      {loading ? (
        <span className="flex items-center">
          <svg
            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Đang xử lý...
        </span>
      ) : (
        <span className="flex items-center">
          <LogIn className="mr-2" size={20} />
          Đăng nhập
        </span>
      )}
    </button>
  )
}

export default LoginButton
