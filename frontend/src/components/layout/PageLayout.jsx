"use client"

import { motion } from "framer-motion"

const PageLayout = ({ children, background = null }) => {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {background}

      <div className="relative z-10 pt-32 pb-20">
        <div className="container mx-auto px-4 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {children}
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default PageLayout
