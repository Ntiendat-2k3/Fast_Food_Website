"use client"

import { motion } from "framer-motion"
import { Sparkles } from "lucide-react"

const ContactHeader = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="text-center mb-12"
    >
      <div className="flex items-center justify-center mb-4">
        <Sparkles className="text-yellow-400 mr-3" size={32} />
        <h1 className="text-4xl font-bold text-white">Liên Hệ Với Chúng Tôi</h1>
      </div>
      <p className="text-gray-300 text-lg max-w-2xl mx-auto">
        Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn. Hãy liên hệ với chúng tôi qua các kênh dưới đây.
      </p>
    </motion.div>
  )
}

export default ContactHeader
