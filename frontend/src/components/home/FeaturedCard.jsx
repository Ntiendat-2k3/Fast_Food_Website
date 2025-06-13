"use client"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { Star, Heart } from "lucide-react"
import { slugify } from "../../utils/slugify"

const FeaturedCard = ({ item, index, url }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="bg-slate-800/50 backdrop-blur-sm rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-slate-700 hover:border-yellow-400/50 group"
    >
      <div className="h-48 overflow-hidden relative">
        <img
          src={url + "/images/" + item.image || "/placeholder.svg"}
          alt={item.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute top-3 right-3 bg-slate-800/80 backdrop-blur-sm rounded-full p-2 shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
          <Heart className="h-5 w-5 text-yellow-400" />
        </div>
      </div>
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold text-white">{item.name}</h3>
          <div className="flex items-center bg-yellow-400/20 px-2 py-1 rounded-full">
            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 mr-1" />
            <span className="text-sm font-medium text-yellow-400">4.8</span>
          </div>
        </div>
        <p className="text-gray-300 mb-4 line-clamp-2">{item.description}</p>
        <div className="flex justify-between items-center">
          <span className="text-xl font-bold text-yellow-400">{item.price.toLocaleString("vi-VN")} đ</span>
          <Link
            to={`/product/${slugify(item.name)}`}
            className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-slate-900 font-medium py-2 px-4 rounded-lg transition-all duration-300 text-sm hover:scale-105"
          >
            Đặt ngay
          </Link>
        </div>
      </div>
    </motion.div>
  )
}

export default FeaturedCard
