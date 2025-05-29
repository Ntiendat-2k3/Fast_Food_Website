"use client"

import { useContext, useState, useEffect } from "react"
import { StoreContext } from "../context/StoreContext"
import FoodItem from "./FoodItem"
import { motion } from "framer-motion"
import axios from "axios"

const FoodDisplay = ({ category }) => {
  const { food_list, url } = useContext(StoreContext)
  const [ratings, setRatings] = useState({})

  useEffect(() => {
    if (food_list.length > 0) {
      fetchAllRatings()
    }
  }, [food_list, url])

  const fetchAllRatings = async () => {
    try {
      const ratingPromises = food_list.map(async (item) => {
        try {
          const response = await axios.get(`${url}/api/comment/food/${item._id}/stats`)
          if (response.data.success) {
            return {
              foodId: item._id,
              rating: response.data.data.averageRating,
              totalReviews: response.data.data.totalReviews,
            }
          }
        } catch (error) {
          console.error(`Error fetching rating for ${item._id}:`, error)
          return { foodId: item._id, rating: 0, totalReviews: 0 }
        }
      })

      const ratingsData = await Promise.all(ratingPromises)
      const ratingsMap = {}
      ratingsData.forEach(({ foodId, rating, totalReviews }) => {
        ratingsMap[foodId] = { rating, totalReviews }
      })
      setRatings(ratingsMap)
    } catch (error) {
      console.error("Error fetching ratings:", error)
    }
  }

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold text-dark dark:text-white mb-6">
        {category === "All" ? "Tất cả món ăn" : category}
      </h2>
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {food_list.map((item, index) => {
          if (category === "All" || category === item.category) {
            const itemRating = ratings[item._id] || { rating: 0, totalReviews: 0 }
            return (
              <FoodItem
                key={index}
                _id={item._id}
                name={item.name}
                description={item.description}
                price={item.price}
                image={item.image}
                index={index}
                rating={itemRating.rating}
                totalReviews={itemRating.totalReviews}
              />
            )
          }
        })}
      </motion.div>
    </div>
  )
}

export default FoodDisplay
