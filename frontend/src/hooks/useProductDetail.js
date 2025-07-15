"use client"

import { useState, useEffect, useContext } from "react"
import { useNavigate } from "react-router-dom"
import { StoreContext } from "../context/StoreContext"
import axios from "axios"
import { toast } from "react-toastify"
import { compareNameWithSlug } from "../utils/slugify"

export const useProductDetail = (slug) => {
  const { addToCart, url, user, token, food_list } = useContext(StoreContext)
  const navigate = useNavigate()

  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState("description")
  const [relatedProducts, setRelatedProducts] = useState([])
  const [isInWishlist, setIsInWishlist] = useState(false)
  const [relatedRatings, setRelatedRatings] = useState({})

  // Tìm sản phẩm dựa trên slug (từ tên sản phẩm)
  const foodItem = food_list.find((item) => compareNameWithSlug(item.name, slug))

  useEffect(() => {
    window.scrollTo(0, 0)

    // Nếu tìm thấy sản phẩm, tìm các sản phẩm liên quan
    if (foodItem) {
      const related = food_list
        .filter((item) => item.category === foodItem.category && item.name !== foodItem.name)
        .slice(0, 4)
      setRelatedProducts(related)

      // Check wishlist status
      if (foodItem._id) {
        checkWishlistStatus(foodItem._id)
      }

      // Fetch ratings for related products
      related.forEach((item) => {
        if (item._id) {
          fetchRelatedRating(item._id)
        }
      })
    }
  }, [foodItem, food_list, slug])

  const fetchRelatedRating = async (foodId) => {
    try {
      const response = await axios.get(`${url}/api/comment/food/${foodId}/stats`)
      if (response.data.success) {
        setRelatedRatings((prev) => ({
          ...prev,
          [foodId]: response.data.data.averageRating,
        }))
      }
    } catch (error) {
      console.error("Error fetching related rating:", error)
    }
  }

  const checkWishlistStatus = async (foodId) => {
    if (!token) return

    try {
      const response = await axios.get(`${url}/api/wishlist/check/${foodId}`, {
        headers: { token },
      })
      if (response.data.success) {
        setIsInWishlist(response.data.isInWishlist)
      }
    } catch (error) {
      console.error("Error checking wishlist status:", error)
    }
  }

  const handleAddToCart = () => {
    if (foodItem) {
      addToCart(foodItem.name, quantity)
      toast.success("Đã thêm vào giỏ hàng", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      })
    }
  }

  const handleBuyNow = () => {
    if (foodItem) {
      // Tạo một giỏ hàng tạm thời chỉ chứa sản phẩm hiện tại
      const tempCartItems = {
        [foodItem.name]: quantity,
      }

      // Chuyển đến trang thanh toán với giỏ hàng tạm thời
      navigate("/order", {
        state: {
          buyNowMode: true,
          tempCartItems: tempCartItems,
          singleProduct: {
            ...foodItem,
            quantity: quantity,
          },
        },
      })
    }
  }

  const increaseQuantity = () => {
    setQuantity((prev) => prev + 1)
  }

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1)
    }
  }

  const toggleWishlist = async () => {
    if (!token) {
      toast.info("Vui lòng đăng nhập để thêm vào danh sách yêu thích")
      return
    }

    if (!foodItem?._id) {
      toast.error("Không thể xác định sản phẩm")
      return
    }

    try {
      const endpoint = isInWishlist ? "/api/wishlist/remove" : "/api/wishlist/add"
      const response = await axios.post(`${url}${endpoint}`, { foodId: foodItem._id }, { headers: { token } })

      if (response.data.success) {
        setIsInWishlist(!isInWishlist)
        toast.success(response.data.message)
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.error("Error toggling wishlist:", error)
      toast.error("Có lỗi xảy ra")
    }
  }

  return {
    foodItem,
    quantity,
    activeTab,
    setActiveTab,
    relatedProducts,
    isInWishlist,
    relatedRatings,
    handleAddToCart,
    handleBuyNow,
    increaseQuantity,
    decreaseQuantity,
    toggleWishlist,
  }
}
