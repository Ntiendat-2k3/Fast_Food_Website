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
  const [isAddingAll, setIsAddingAll] = useState(false)

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

  const addAllToCart = async () => {
    if (wishlistItems.length === 0) {
      toast.warning("Danh sách yêu thích trống")
      return
    }

    setIsAddingAll(true)

    try {
      let successCount = 0
      let errorCount = 0

      // Thêm từng sản phẩm vào giỏ hàng
      for (const item of wishlistItems) {
        try {
          if (item.foodId && item.foodId._id) {
            await addToCart(item.foodId._id)
            successCount++
          }
        } catch (error) {
          console.error(`Error adding ${item.foodId?.name} to cart:`, error)
          errorCount++
        }
      }

      // Hiển thị thông báo kết quả
      if (successCount > 0) {
        toast.success(`Đã thêm ${successCount} sản phẩm vào giỏ hàng thành công!`)
      }

      if (errorCount > 0) {
        toast.warning(`${errorCount} sản phẩm không thể thêm vào giỏ hàng`)
      }

    } catch (error) {
      console.error("Error adding all items to cart:", error)
      toast.error("Có lỗi xảy ra khi thêm sản phẩm vào giỏ hàng")
    } finally {
      setIsAddingAll(false)
    }
  }

  return {
    wishlistItems,
    loading,
    ratings,
    removeFromWishlist,
    addAllToCart,
    isAddingAll,
  }
}

export default useWishlist
