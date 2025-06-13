"use client"
import { motion } from "framer-motion"

const ServiceCard = ({ service, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-8 shadow-lg hover:shadow-yellow-400/10 transition-all hover:-translate-y-1 border border-slate-700 hover:border-yellow-400/50 group"
    >
      <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-xl w-16 h-16 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
        {service.icon}
      </div>
      <h3 className="text-xl font-bold text-white mb-3">{service.title}</h3>
      <p className="text-gray-300">{service.description}</p>
    </motion.div>
  )
}

export default ServiceCard
