"use client"

import { useState } from "react"
import { Copy, Check } from "lucide-react"
import { toast } from "react-toastify"
import { motion } from "framer-motion"

const CopyableField = ({ label, value }) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(value)
    setCopied(true)
    toast.success("Đã sao chép vào clipboard")
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex justify-between items-center mb-3">
      <span className="text-gray-400">{label}:</span>
      <div className="flex items-center">
        <span className="text-white font-medium mr-2">{value}</span>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleCopy}
          className={`p-1.5 ${copied ? "bg-green-600/50" : "bg-slate-600/50 hover:bg-slate-600"} rounded text-gray-300 transition-colors`}
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
        </motion.button>
      </div>
    </div>
  )
}

export default CopyableField
