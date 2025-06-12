"use client"

const Badge = ({ children, variant = "default", size = "md", className = "" }) => {
  const variants = {
    default: "bg-slate-600 text-white",
    primary: "bg-primary text-slate-900",
    success: "bg-green-500 text-white",
    warning: "bg-yellow-500 text-slate-900",
    danger: "bg-red-500 text-white",
    info: "bg-blue-500 text-white",
  }

  const sizes = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-sm",
    lg: "px-3 py-1.5 text-base",
  }

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </span>
  )
}

export default Badge
