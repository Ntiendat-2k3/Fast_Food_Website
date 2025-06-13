"use client"

import { motion } from "framer-motion"

const HeroTitle = () => {
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="relative inline-block"
    >
      <h1 className="text-5xl md:text-7xl font-black mb-6 bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-400 bg-clip-text text-transparent leading-tight drop-shadow-lg">
        THỰC ĐƠN
        <br />
        <span className="text-4xl md:text-6xl bg-gradient-to-r from-amber-300 to-yellow-400 bg-clip-text text-transparent">
          ĐẶC BIỆT
        </span>
      </h1>

      {/* Decorative Elements */}
      <motion.div
        className="absolute -top-4 -right-4 w-8 h-8 bg-yellow-400 rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
      />
      <motion.div
        className="absolute -bottom-2 -left-6 w-6 h-6 bg-yellow-400 rounded-full"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
      />
    </motion.div>
  )
}

export default HeroTitle
