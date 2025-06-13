"use client"

import { motion } from "framer-motion"

const PaymentContainer = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-gray-900 to-slate-800 py-20 px-4">
      <div className="relative max-w-3xl mx-auto">
        {/* Animated orbs */}
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary/20 rounded-full filter blur-3xl animate-pulse-slow"></div>
        <div
          className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary/10 rounded-full filter blur-3xl animate-pulse-slow"
          style={{ animationDelay: "2s" }}
        ></div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-xl overflow-hidden"
        >
          <div className="p-6 md:p-8">{children}</div>
        </motion.div>
      </div>
    </div>
  )
}

export default PaymentContainer
