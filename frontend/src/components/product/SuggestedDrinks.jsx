"use client"

import { useContext } from "react"
import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { StoreContext } from "../../context/StoreContext"
import SuggestedDrinkRowItem from "./SuggestedDrinkRowItem"
import LoadingSpinner from "../common/LoadingSpinner"
import EmptyState from "../common/EmptyState"
import { slugify } from "../../utils/slugify"

const SuggestedDrinks = ({ drinks, isLoading, isCompact = false }) => {
  const { url, addToCart } = useContext(StoreContext)
  const navigate = useNavigate()

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-24">
        <LoadingSpinner />
      </div>
    )
  }

  if (!drinks || drinks.length === 0) {
    return (
      <EmptyState
        title="Không có đồ uống gợi ý"
        description="Hiện tại không có đồ uống nào được gợi ý."
        className="py-4"
      />
    )
  }

  const displayDrinks = isCompact ? drinks.slice(0, 2) : drinks

  return (
    <section className={`${isCompact ? "py-4" : "py-8"}`}>
      <h3 className={`${isCompact ? "text-xl" : "text-2xl"} font-bold text-white mb-4 text-center`}>
        Gợi ý đồ uống kèm theo
      </h3>
      <motion.div
        className="flex flex-col gap-4"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.1,
            },
          },
        }}
      >
        {displayDrinks.map((item, index) => (
          <SuggestedDrinkRowItem
            key={item._id}
            item={item}
            url={url}
            addToCart={addToCart}
          />
        ))}
      </motion.div>

      {isCompact && drinks.length > displayDrinks.length && (
        <div className="text-center mt-4">
          <button
            onClick={() => navigate(`/foods?category=${slugify("Đồ uống")}`)}
            className="text-primary hover:underline text-sm font-semibold"
          >
            Xem thêm đồ uống khác
          </button>
        </div>
      )}
    </section>
  )
}

export default SuggestedDrinks
