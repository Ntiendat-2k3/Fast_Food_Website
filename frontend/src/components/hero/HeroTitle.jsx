"use client"
import { motion } from "framer-motion"

const HeroTitle = () => {
  return (
    <motion.h1
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4 md:mb-6 leading-tight"
    >
      Khám phá{" "}
      <span className="bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
        Thực đơn
      </span>{" "}
      tuyệt vời
    </motion.h1>
  )
}

export default HeroTitle
