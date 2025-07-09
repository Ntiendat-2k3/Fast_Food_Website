import { LogIn, Shield } from "lucide-react"

const LoginButton = ({ loading }) => {
  return (
    <button
      type="submit"
      disabled={loading}
      className="group relative w-full flex justify-center py-4 px-6 border border-transparent rounded-xl text-black font-bold bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 hover:from-yellow-500 hover:via-amber-600 hover:to-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 focus:ring-offset-gray-900 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl hover:shadow-yellow-500/25 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none overflow-hidden"
    >
      {/* Button Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-white/10 to-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

      {/* Shimmer Effect */}
      <div className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-pulse transition-opacity duration-300"></div>

      {loading ? (
        <span className="flex items-center relative z-10">
          <svg
            className="animate-spin -ml-1 mr-3 h-5 w-5 text-black"
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
          <span className="font-bold tracking-wide">Đang xử lý...</span>
        </span>
      ) : (
        <span className="flex items-center relative z-10">
          <LogIn className="mr-3 w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
          <span className="font-bold tracking-wide">ĐĂNG NHẬP</span>
          <Shield className="ml-3 w-5 h-5 group-hover:-rotate-12 transition-transform duration-300" />
        </span>
      )}
    </button>
  )
}

export default LoginButton
