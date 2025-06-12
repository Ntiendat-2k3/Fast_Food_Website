"use client"

const PageContainer = ({ children, className = "", maxWidth = "container", padding = true }) => {
  const maxWidths = {
    container: "container mx-auto",
    full: "w-full",
    sm: "max-w-2xl mx-auto",
    md: "max-w-4xl mx-auto",
    lg: "max-w-6xl mx-auto",
    xl: "max-w-7xl mx-auto",
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 pt-20 pb-16">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-yellow-400/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-80 h-80 bg-yellow-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className={`${maxWidths[maxWidth]} ${padding ? "px-4" : ""} relative z-10 ${className}`}>{children}</div>
    </div>
  )
}

export default PageContainer
