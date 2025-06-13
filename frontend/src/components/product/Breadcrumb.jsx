"use client"

import { motion } from "framer-motion"
import { ChevronRight } from "lucide-react"

const Breadcrumb = ({ items }) => {
  return (
    <motion.nav initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex py-4 text-sm">
      <ol className="flex items-center space-x-1">
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && <ChevronRight size={16} className="text-gray-500 mx-1" />}
            {item.link ? (
              <a href={item.link} className="text-gray-400 hover:text-primary transition-colors">
                {item.label}
              </a>
            ) : (
              <span className="text-white font-medium">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </motion.nav>
  )
}

export default Breadcrumb
