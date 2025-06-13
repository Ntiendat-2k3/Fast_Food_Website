"use client"

import { useState, useEffect, useContext } from "react"
import { StoreContext } from "../context/StoreContext"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import axios from "axios"

const useWishlist = () => {
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

  const addAllToCart = () => {
    wishlistItems.forEach((item) => {
      addToCart(item.foodId.name, 1)
    })
    toast.success("Đã thêm tất cả vào giỏ hàng")
  }

  return {
    wishlistItems,
    loading,
    ratings,
    removeFromWishlist,
    addAllToCart,
  }
}

export default useWishlist
