"use client"

import { motion } from "framer-motion"

const MenuSectionHeader = () => {
  return (
    <div className="text-center mb-12">
      <motion.h2
        className="text-3xl md:text-4xl font-bold text-white mb-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        Danh Mục Món Ăn
      </motion.h2>
      <motion.div
        className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-amber-400 mx-auto rounded-full"
        initial={{ width: 0 }}
        animate={{ width: 96 }}
        transition={{ delay: 1.2, duration: 0.8 }}
      />
    </div>
  )
}

export default MenuSectionHeader
