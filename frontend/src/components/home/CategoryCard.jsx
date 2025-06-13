"use client"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"

const CategoryCard = ({ category, index }) => {
  return (
    <Link to="/foods">
      <motion.div
        whileHover={{ y: -5, scale: 1.02 }}
        className="relative rounded-xl overflow-hidden shadow-md h-40 group bg-slate-800/50 backdrop-blur-sm border border-slate-700 hover:border-yellow-400/50 transition-all duration-300"
      >
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-800/50 to-transparent z-10"></div>
        <img
          src={category.image || "/placeholder.svg"}
          alt={category.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute bottom-0 left-0 p-4 z-20">
          <h3 className="text-white font-bold text-xl">{category.name}</h3>
        </div>
        <div className="absolute top-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="bg-yellow-400 text-slate-900 p-1 rounded-full">
            <ArrowRight size={16} />
          </div>
        </div>
      </motion.div>
    </Link>
  )
}

export default CategoryCard
