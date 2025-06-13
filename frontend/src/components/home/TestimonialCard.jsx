"use client"
import { motion } from "framer-motion"
import { Star } from "lucide-react"

const TestimonialCard = ({ testimonial, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-slate-700 hover:border-yellow-400/50"
    >
      <div className="flex items-center mb-4">
        <img
          src={testimonial.image || "/placeholder.svg"}
          alt={testimonial.name}
          className="w-14 h-14 rounded-full object-cover mr-4 border-2 border-yellow-400"
        />
        <div>
          <h4 className="font-bold text-white">{testimonial.name}</h4>
          <p className="text-gray-300 text-sm">{testimonial.role}</p>
        </div>
      </div>
      <p className="text-gray-300 italic mb-4">"{testimonial.comment}"</p>
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className="h-5 w-5 text-yellow-400 fill-yellow-400" />
        ))}
      </div>
    </motion.div>
  )
}

export default TestimonialCard
