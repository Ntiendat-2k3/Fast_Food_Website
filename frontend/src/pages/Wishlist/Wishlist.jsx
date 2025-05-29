"use client"

import { useContext, useEffect, useState } from "react"
import { StoreContext } from "../../context/StoreContext"
import { useNavigate } from "react-router-dom"
import { Heart, ShoppingCart, Trash2, Star, Sparkles, Plus } from "lucide-react"
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 pt-20 pb-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 pt-20 pb-16">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center mb-4">
            <Sparkles className="text-primary mr-3" size={32} />
            <h1 className="text-4xl font-bold text-white">Danh sách yêu thích</h1>
          </div>
          <p className="text-gray-300 text-lg">
            {wishlistItems.length > 0
              ? `Bạn có ${wishlistItems.length} sản phẩm trong danh sách yêu thích`
              : "Danh sách yêu thích của bạn đang trống"}
          </p>
        </motion.div>

        {wishlistItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center py-16"
          >
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 max-w-md mx-auto shadow-2xl border border-slate-700">
              <div className="bg-slate-700/50 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                <Heart size={48} className="text-gray-400" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">Danh sách yêu thích trống</h2>
              <p className="text-gray-300 mb-6">Hãy thêm những món ăn yêu thích của bạn để dễ dàng tìm lại sau này</p>
              <button
                onClick={() => navigate("/foods")}
                className="bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-slate-900 py-3 px-8 rounded-xl transition-all duration-300 font-medium hover:scale-105"
              >
                Khám phá thực đơn
              </button>
            </div>
          </motion.div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {wishlistItems.map((item, index) => (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="bg-slate-800/50 backdrop-blur-xl rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-700 hover:border-primary/50 group"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={`${url}/images/${item.foodId.image}`}
                      alt={item.foodId.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 cursor-pointer"
                      onClick={() => handleProductClick(item.foodId.name)}
                    />
                    <div className="absolute top-3 right-3 flex space-x-2">
                      <div className="bg-slate-800/80 backdrop-blur-sm rounded-full p-2 shadow-md">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-primary fill-primary" />
                          <span className="text-xs font-medium ml-1 text-white">
                            {ratings[item.foodId._id] ? ratings[item.foodId._id].toFixed(1) : "0.0"}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFromWishlist(item.foodId._id)}
                        className="bg-red-500/80 backdrop-blur-sm hover:bg-red-500 text-white p-2 rounded-full transition-all duration-300 hover:scale-110"
                        aria-label="Xóa khỏi yêu thích"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  <div className="p-5">
                    <h3
                      className="text-lg font-bold text-white mb-1 truncate cursor-pointer hover:text-primary transition-colors"
                      onClick={() => handleProductClick(item.foodId.name)}
                    >
                      {item.foodId.name}
                    </h3>
                    <p className="text-gray-300 text-sm mb-4 line-clamp-2">{item.foodId.description}</p>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xl font-bold text-primary">
                        {item.foodId.price.toLocaleString("vi-VN")} đ
                      </span>
                      <button
                        onClick={() => handleAddToCart(item.foodId.name)}
                        className="bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-slate-900 p-2 rounded-full transition-all duration-300 hover:scale-110"
                        aria-label="Thêm vào giỏ hàng"
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                    <div className="text-xs text-gray-400 border-t border-slate-600 pt-3">
                      Đã thêm: {new Date(item.createdAt).toLocaleDateString("vi-VN")}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-8 text-center"
            >
              <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-slate-700">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center justify-center">
                  <Heart className="mr-2 text-primary" size={20} />
                  Thao tác nhanh
                </h3>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => {
                      wishlistItems.forEach((item) => {
                        handleAddToCart(item.foodId.name)
                      })
                    }}
                    className="bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-slate-900 py-3 px-8 rounded-xl transition-all duration-300 flex items-center justify-center font-medium hover:scale-105"
                  >
                    <ShoppingCart size={18} className="mr-2" />
                    Thêm tất cả vào giỏ hàng
                  </button>
                  <button
                    onClick={() => navigate("/foods")}
                    className="border border-primary text-primary hover:bg-primary hover:text-slate-900 py-3 px-8 rounded-xl transition-all duration-300 font-medium"
                  >
                    Tiếp tục mua sắm
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </div>
    </div>
  )
}

export default Wishlist
