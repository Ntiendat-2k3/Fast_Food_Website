import { Shield, Sparkles, Crown } from "lucide-react"

const LoginHeader = ({ logoSrc = "/logo.png" }) => {
  return (
    <div className="text-center mb-8 relative">
      {/* Logo Container */}
      <div className="relative inline-block mb-6">
        <div className="relative">
          <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 via-amber-500 to-yellow-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-yellow-500/30 mx-auto transform hover:scale-105 transition-transform duration-300">
            <img
              className="w-12 h-12 object-contain filter drop-shadow-lg"
              src={logoSrc || "/placeholder.svg"}
              alt="Logo"
              onError={(e) => {
                e.target.style.display = "none"
                e.target.nextSibling.style.display = "block"
              }}
            />
            <Shield className="w-12 h-12 text-black hidden" />
          </div>

          {/* Glow Effects */}
          <div className="absolute -inset-3 bg-gradient-to-r from-yellow-400/30 via-amber-500/30 to-yellow-600/30 rounded-3xl blur-xl animate-pulse"></div>
          <div className="absolute -inset-6 bg-gradient-to-r from-yellow-400/10 via-amber-500/10 to-yellow-600/10 rounded-3xl blur-2xl animate-pulse delay-1000"></div>

          {/* Floating Icons */}
          <Sparkles className="absolute -top-3 -right-3 w-6 h-6 text-yellow-400 animate-bounce" />
          <Crown className="absolute -top-2 -left-4 w-5 h-5 text-amber-500 animate-pulse" />
        </div>
      </div>

      {/* Title */}
      <div className="space-y-4">
        <h1 className="text-5xl font-black bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500 bg-clip-text text-transparent mb-2 tracking-tight">
          ADMIN
        </h1>
        <h2 className="text-2xl font-bold text-white/90 tracking-wide">CONTROL PANEL</h2>

        {/* Decorative Line */}
        <div className="flex items-center justify-center space-x-2">
          <div className="w-8 h-0.5 bg-gradient-to-r from-transparent to-yellow-400"></div>
          <div className="w-12 h-1 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-400 rounded-full"></div>
          <div className="w-8 h-0.5 bg-gradient-to-r from-yellow-400 to-transparent"></div>
        </div>

        <p className="text-gray-300 text-lg font-medium max-w-sm mx-auto leading-relaxed">
          Truy cập vào hệ thống quản lý với quyền hạn cao nhất
        </p>

        {/* Status Indicators */}
        <div className="flex items-center justify-center space-x-6 mt-6">
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>System Online</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse delay-500"></div>
            <span>Secure Access</span>
          </div>
        </div>

        {/* Animated Dots */}
        <div className="flex items-center justify-center space-x-2 mt-6">
          <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce delay-100"></div>
          <div className="w-2 h-2 bg-yellow-600 rounded-full animate-bounce delay-200"></div>
        </div>
      </div>
    </div>
  )
}

export default LoginHeader
