"use client"

import { MessageCircle } from "lucide-react"

const LoginPrompt = ({ onLoginClick }) => {
  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="text-center">
        <MessageCircle size={64} className="mx-auto mb-4 text-gray-500" />
        <p className="mb-4 text-gray-300">Vui lòng đăng nhập để chat với chúng tôi</p>
        <button
          onClick={onLoginClick}
          className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-slate-900 px-6 py-3 rounded-xl transition-all duration-300 font-medium"
        >
          Đăng Nhập
        </button>
      </div>
    </div>
  )
}

export default LoginPrompt
