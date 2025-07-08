import { LogIn, Loader2 } from "lucide-react"

const LoginButton = ({ isLoading }) => {
  return (
    <button
      type="submit"
      disabled={isLoading}
      className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 px-4 rounded-lg font-medium hover:from-orange-600 hover:to-red-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
    >
      {isLoading ? (
        <>
          <Loader2 size={20} className="animate-spin mr-2" />
          Đang đăng nhập...
        </>
      ) : (
        <>
          <LogIn size={20} className="mr-2" />
          Đăng nhập
        </>
      )}
    </button>
  )
}

export default LoginButton
