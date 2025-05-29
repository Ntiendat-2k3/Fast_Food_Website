"use client"

import { useContext, useEffect, useState } from "react"
import { StoreContext } from "../../context/StoreContext"
import { useNavigate } from "react-router-dom"
import { Heart, ShoppingCart, Trash2, Star } from "lucide-react"
import { motion } from "framer-motion"
import { slugify } from "../../utils/slugify"
import { toast } from "react-toastify"
import axios from "axios"

const Wishlist = () => {
  const { url, token, addToCart } = useContext(StoreContext)
  const navigate = useNavigate()
  const [wishlistItems, setWishlistItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [ratings, setRatings] = useState({})

  useEffect(() => {
    if (!token) {
      navigate("/")
      return
    }
    fetchWishlist()
  }, [token, navigate])

  const fetchWishlist = async () => {
    try {
      setLoading(true)
      const response = await axios.post(
        `${url}/api/wishlist/get`,
        {},
        {
          headers: { token },
        },
      )

      if (response.data.success) {
        setWishlistItems(response.data.data)
        // Fetch ratings for each item
        response.data.data.forEach((item) => {
          if (item.foodId) {
            fetchRating(item.foodId._id)
          }
        })
      }
    } catch (error) {
      console.error("Error fetching wishlist:", error)
      toast.error("Lỗi khi tải danh sách yêu thích")
    } finally {
      setLoading(false)
    }
  }

  const fetchRating = async (foodId) => {
    try {
      const response = await axios.get(`${url}/api/comment/food/${foodId}/stats`)
      if (response.data.success) {
        setRatings((prev) => ({
          ...prev,
          [foodId]: response.data.data.averageRating,
        }))
      }
    } catch (error) {
      console.error("Error fetching rating:", error)
    }
  }

  const removeFromWishlist = async (foodId) => {
    try {
      const response = await axios.post(
        `${url}/api/wishlist/remove`,
        { foodId },
        {
          headers: { token },
        },
      )

      if (response.data.success) {
        setWishlistItems((prev) => prev.filter((item) => item.foodId._id !== foodId))
        toast.success("Đã xóa khỏi danh sách yêu thích")
      }
    } catch (error) {
      console.error("Error removing from wishlist:", error)
      toast.error("Lỗi khi xóa khỏi danh sách yêu thích")
    }
  }

  const handleAddToCart = (foodName) => {
    addToCart(foodName, 1)
    toast.success("Đã thêm vào giỏ hàng")
  }

  const handleProductClick = (foodName) => {
    navigate(`/product/${slugify(foodName)}`)
  }

  if (!token) {
    return null
  }

  if (loading) {
    return (
      <div className="pt-20 pb-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-20 pb-16 min-h-screen bg-gray-50 dark:bg-dark">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-dark dark:text-white mb-2">Danh sách yêu thích</h1>
          <p className="text-gray-600 dark:text-gray-300">
            {wishlistItems.length > 0
              ? `Bạn có ${wishlistItems.length} sản phẩm trong danh sách yêu thích`
              : "Danh sách yêu thích của bạn đang trống"}
          </p>
        </div>

        {wishlistItems.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-white dark:bg-dark-light rounded-xl p-8 max-w-md mx-auto shadow-sm">
              <Heart size={64} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
              <h2 className="text-xl font-semibold text-dark dark:text-white mb-2">Danh sách yêu thích trống</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Hãy thêm những món ăn yêu thích của bạn để dễ dàng tìm lại sau này
              </p>
              <button
                onClick={() => navigate("/foods")}
                className="bg-primary hover:bg-primary-light text-dark py-2 px-6 rounded-lg transition-colors"
              >
                Khám phá thực đơn
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlistItems.map((item, index) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="bg-white dark:bg-dark-light rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 dark:border-dark-lighter group"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={`${url}/images/${item.foodId.image}`}
                    alt={item.foodId.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 cursor-pointer"
                    onClick={() => handleProductClick(item.foodId.name)}
                  />
                  <div className="absolute top-2 right-2 flex space-x-2">
                    <div className="bg-white dark:bg-dark-lighter rounded-full p-1 shadow-sm">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        <span className="text-xs font-medium ml-1 text-dark dark:text-white">
                          {ratings[item.foodId._id] ? ratings[item.foodId._id].toFixed(1) : "0.0"}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFromWishlist(item.foodId._id)}
                      className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-colors"
                      aria-label="Xóa khỏi yêu thích"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <h3
                    className="text-lg font-bold text-dark dark:text-white mb-1 truncate cursor-pointer hover:text-primary transition-colors"
                    onClick={() => handleProductClick(item.foodId.name)}
                  >
                    {item.foodId.name}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                    {item.foodId.description}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-primary">
                      {item.foodId.price.toLocaleString("vi-VN")} đ
                    </span>
                    <button
                      onClick={() => handleAddToCart(item.foodId.name)}
                      className="bg-primary hover:bg-primary-light text-dark p-2 rounded-full transition-colors"
                      aria-label="Thêm vào giỏ hàng"
                    >
                      <ShoppingCart size={18} />
                    </button>
                  </div>
                  <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                    Đã thêm: {new Date(item.createdAt).toLocaleDateString("vi-VN")}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        {wishlistItems.length > 0 && (
          <div className="mt-8 text-center">
            <div className="bg-white dark:bg-dark-light rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-dark dark:text-white mb-4">Thao tác nhanh</h3>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => {
                    wishlistItems.forEach((item) => {
                      handleAddToCart(item.foodId.name)
                    })
                  }}
                  className="bg-primary hover:bg-primary-light text-dark py-2 px-6 rounded-lg transition-colors flex items-center justify-center"
                >
                  <ShoppingCart size={18} className="mr-2" />
                  Thêm tất cả vào giỏ hàng
                </button>
                <button
                  onClick={() => navigate("/foods")}
                  className="border border-primary text-primary hover:bg-primary hover:text-dark py-2 px-6 rounded-lg transition-colors"
                >
                  Tiếp tục mua sắm
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Wishlist
