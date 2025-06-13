"use client"

const PageHeader = ({ icon, title, className = "" }) => {
  return (
    <div className={`p-6 border-b border-slate-700 bg-gradient-to-r from-slate-800/80 to-slate-700/80 ${className}`}>
      <div className="flex items-center">
        {icon && <span className="text-yellow-400 mr-3">{icon}</span>}
        <h1 className="text-2xl font-bold text-white">{title}</h1>
      </div>
    </div>
  )
}

export default PageHeader
