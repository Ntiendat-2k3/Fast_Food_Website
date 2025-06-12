"use client"

import { motion } from "framer-motion"

const PageHeader = ({ title, subtitle, icon, breadcrumb, actions, className = "" }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`bg-slate-800/50 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border border-slate-700 mb-8 ${className}`}
    >
      <div className="p-6 border-b border-slate-700 bg-gradient-to-r from-slate-800/80 to-slate-700/80">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {icon && <div className="text-yellow-400 mr-3">{icon}</div>}
            <div>
              <h1 className="text-2xl font-bold text-white">{title}</h1>
              {subtitle && <p className="text-gray-300 mt-1">{subtitle}</p>}
            </div>
          </div>
          {actions && <div className="flex items-center gap-3">{actions}</div>}
        </div>

        {breadcrumb && (
          <nav className="flex py-4 text-sm mt-4 border-t border-slate-700">
            <ol className="flex items-center space-x-1">
              {breadcrumb.map((item, index) => (
                <li key={index} className="flex items-center">
                  {index > 0 && <span className="text-gray-500 mx-2">/</span>}
                  {item.href ? (
                    <a href={item.href} className="text-gray-400 hover:text-primary transition-colors">
                      {item.label}
                    </a>
                  ) : (
                    <span className="text-white font-medium">{item.label}</span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}
      </div>
    </motion.div>
  )
}

export default PageHeader
