"use client"

import { motion } from "framer-motion"

const ChatMessage = ({ message, baseUrl }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`mb-4 flex ${message.isAdmin ? "justify-start" : "justify-end"}`}
    >
      <div
        className={`max-w-[85%] sm:max-w-[70%] p-3 rounded-xl ${
          message.isAdmin
            ? "bg-slate-700/50 text-gray-200 border border-slate-600"
            : "bg-gradient-to-r from-yellow-400 to-yellow-500 text-slate-900"
        }`}
      >
        {message.image && (
          <img
            src={`${baseUrl}/images/${message.image}`}
            alt="Message attachment"
            className="mb-2 rounded-md max-w-full"
            style={{ maxHeight: "200px" }}
          />
        )}
        <p className="break-words">{message.content}</p>
        <div className={`text-xs mt-1 ${message.isAdmin ? "text-gray-400" : "text-slate-700"}`}>
          {new Date(message.createdAt).toLocaleTimeString()}
        </div>
      </div>
    </motion.div>
  )
}

export default ChatMessage
