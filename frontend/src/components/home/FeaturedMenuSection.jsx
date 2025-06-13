"use client"
import { Link } from "react-router-dom"
import { ChevronRight } from "lucide-react"
import FeaturedCard from "./FeaturedCard"

const FeaturedMenuSection = ({ featuredItems, url }) => {
  return (
    <section className="py-16 relative">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-3xl font-bold">
            <span className="text-white">Thực đơn </span>
            <span className="bg-gradient-to-r from-yellow-400 to-yellow-500 bg-clip-text text-transparent">
              nổi bật
            </span>
          </h2>
          <Link
            to="/foods"
            className="text-yellow-400 hover:text-yellow-300 flex items-center font-medium transition-colors"
          >
            Xem tất cả <ChevronRight size={18} className="ml-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuredItems.map((item, index) => (
            <FeaturedCard key={item.name} item={item} index={index} url={url} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default FeaturedMenuSection
