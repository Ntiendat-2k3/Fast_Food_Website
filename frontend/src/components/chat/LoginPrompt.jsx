"use client"

import { LogIn, MessageCircle, Shield, Zap } from "lucide-react"

const LoginPrompt = ({ onLoginClick }) => {
  return (
    <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-b from-slate-900/30 to-slate-800/30">
      <div className="text-center max-w-md">
        {/* Icon */}
        <div className="relative inline-block mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-yellow-400/20 to-yellow-600/20 rounded-full flex items-center justify-center border border-yellow-500/30">
            <MessageCircle size={32} className="text-yellow-400" />
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
            <Shield size={14} className="text-slate-900" />
          </div>
        </div>

        {/* Title */}
        <h3 className="text-2xl font-bold text-white mb-3">Đăng nhập để chat</h3>

        {/* Description */}
        <p className="text-gray-400 mb-6 leading-relaxed">
          Vui lòng đăng nhập để bắt đầu cuộc trò chuyện với đội ngũ hỗ trợ khách hàng của chúng tôi
        </p>

        {/* Features */}
        <div className="space-y-3 mb-8">
          <div className="flex items-center space-x-3 text-sm text-gray-300">
            <div className="w-6 h-6 bg-yellow-500/20 rounded-full flex items-center justify-center">
              <Zap size={12} className="text-yellow-400" />
            </div>
            <span>Phản hồi nhanh chóng</span>
          </div>
          <div className="flex items-center space-x-3 text-sm text-gray-300">
            <div className="w-6 h-6 bg-yellow-500/20 rounded-full flex items-center justify-center">
              <Shield size={12} className="text-yellow-400" />
            </div>
            <span>Bảo mật thông tin</span>
          </div>
          <div className="flex items-center space-x-3 text-sm text-gray-300">
            <div className="w-6 h-6 bg-yellow-500/20 rounded-full flex items-center justify-center">
              <MessageCircle size={12} className="text-yellow-400" />
            </div>
            <span>Hỗ trợ 24/7</span>
          </div>
        </div>

        {/* Login Button */}
        <button
          onClick={onLoginClick}
          className="group bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-slate-900 font-semibold px-8 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-yellow-500/25 transform hover:scale-105 active:scale-95 flex items-center space-x-2 mx-auto"
        >
          <LogIn size={20} className="group-hover:rotate-12 transition-transform duration-200" />
          <span>Đăng nhập ngay</span>
        </button>

        {/* Additional Info */}
        <p className="text-xs text-gray-500 mt-4">Chưa có tài khoản? Đăng ký miễn phí để trải nghiệm dịch vụ</p>
      </div>
    </div>
  )
}

export default LoginPrompt
