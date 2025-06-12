"use client"

import { motion } from "framer-motion"
import Button from "./Button"

const EmptyState = ({ icon, title, description, action, actionText, className = "" }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`text-center py-12 ${className}`}
    >
      <div className="bg-slate-700/50 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">{icon}</div>
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      {description && <p className="text-gray-400 mb-6 max-w-md mx-auto">{description}</p>}
      {action && actionText && (
        <Button onClick={action} variant="primary">
          {actionText}
        </Button>
      )}
    </motion.div>
  )
}

export default EmptyState
