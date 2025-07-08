import { Shield } from "lucide-react"

const LoginHeader = () => {
  return (
    <div className="text-center mb-8">
      <div className="flex justify-center mb-4">
        <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
          <Shield size={32} className="text-white" />
        </div>
      </div>
      <h1 className="text-3xl font-bold text-white mb-2">Admin Panel</h1>
      <p className="text-gray-400">Đăng nhập để truy cập hệ thống quản trị</p>
    </div>
  )
}

export default LoginHeader
