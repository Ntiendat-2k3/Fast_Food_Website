"use client"

import { useState, useEffect, useContext, useCallback } from "react"
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
  const [ratingStats, setRatingStats] = useState({ averageRating: 0, totalReviews: 0 })
  const [suggestedDrinks, setSuggestedDrinks] = useState([])
  const [isLoadingSuggestedDrinks, setIsLoadingSuggestedDrinks] = useState(false)
  const [stock, setStock] = useState(0)
  const [isLoadingStock, setIsLoadingStock] = useState(true)
  const [stockError, setStockError] = useState(null)

  const foodItem = food_list?.find((item) => {
    if (!slug || !item?.name) {
      return false
    }

    const match = compareNameWithSlug(item.name, slug)
    return match
  })

  // Fetch product stock from backend (with fallback to default)
  const fetchProductStock = useCallback(
    async (productId) => {
      if (!productId) {
        console.log("❌ No productId provided to fetchProductStock")
        setIsLoadingStock(false)
        return
      }

      console.log("🔍 Fetching stock for productId:", productId)
      setIsLoadingStock(true)
      setStockError(null)

      try {
        const response = await axios.get(`${url}/api/inventory/product/${productId}`)
        console.log("📦 Stock API Response:", response.data)

        if (response.data.success) {
          const stockQuantity = response.data.data.quantity || 0
          console.log("✅ Stock fetched successfully:", stockQuantity)
          setStock(stockQuantity)
        } else {
          console.log("⚠️ Stock API returned success: false", response.data.message)
          setStock(0)
          setStockError(response.data.message)
        }
      } catch (error) {
        console.error("❌ Error fetching stock:", error)
        setStock(0)
        setStockError(error.message)
      } finally {
        setIsLoadingStock(false)
      }
    },
    [url],
  )

  const fetchRatingsForProducts = useCallback(
    async (productIds) => {
      if (!productIds || productIds.length === 0) return

      try {
        const response = await axios.post(`${url}/api/comment/batch-ratings`, { foodIds: productIds })

        if (response.data.success) {
          const newRatingsMap = {}

          // Handle both data and ratings format
          if (response.data.data) {
            Object.keys(response.data.data).forEach((foodId) => {
              newRatingsMap[foodId] = response.data.data[foodId]
            })
          }

          if (response.data.ratings) {
            response.data.ratings.forEach((r) => {
              newRatingsMap[r.foodId] = {
                rating: r.averageRating,
                totalReviews: r.totalReviews,
                averageRating: r.averageRating,
                ratingDistribution: r.ratingDistribution,
              }
            })
          }

          setRelatedRatings((prev) => ({ ...prev, ...newRatingsMap }))
        } else {
          console.error("Failed to fetch ratings:", response.data.message)
        }
      } catch (error) {
        console.error("Error fetching ratings:", error)
      }
    },
    [url],
  )

  // Main effect to handle food item changes
  useEffect(() => {
    console.log("useProductDetail effect triggered")
    console.log("slug:", slug)
    console.log("food_list length:", food_list?.length)
    console.log("foodItem:", foodItem)

    window.scrollTo(0, 0)

    // Check if we have valid slug and food_list
    if (!slug || slug === "undefined") {
      console.log("Invalid slug, returning early")
      return
    }

    if (!food_list || food_list.length === 0) {
      console.log("No food_list, returning early")
      return
    }

    if (foodItem) {
      console.log("Processing foodItem:", foodItem.name, "ID:", foodItem._id)

      // Fetch stock for the current product
      if (foodItem._id) {
        console.log("Calling fetchProductStock with ID:", foodItem._id)
        fetchProductStock(foodItem._id)
      } else {
        console.log("No foodItem._id found")
        setIsLoadingStock(false)
      }

      // Set rating stats for the current food item
      if (relatedRatings[foodItem._id]) {
        setRatingStats(relatedRatings[foodItem._id])
      } else {
        fetchRatingsForProducts([foodItem._id])
      }

      const related = food_list
        .filter((item) => item.category === foodItem.category && item.name !== foodItem.name)
        .slice(0, 4)
      setRelatedProducts(related)

      if (related.length > 0) {
        fetchRatingsForProducts(related.map((item) => item._id))
      }

      // Fetch suggested drinks if the current product is not a drink
      if (foodItem.category !== "Đồ uống") {
        setIsLoadingSuggestedDrinks(true)
        axios
          .get(`${url}/api/food/suggested-drinks/${encodeURIComponent(foodItem.category)}`)
          .then((response) => {
            if (response.data.success) {
              const drinks = response.data.data.slice(0, 4)
              setSuggestedDrinks(drinks)
              // Fetch ratings for suggested drinks
              if (drinks.length > 0) {
                fetchRatingsForProducts(drinks.map((item) => item._id))
              }
            } else {
              console.error("Failed to fetch suggested drinks:", response.data.message)
            }
          })
          .catch((error) => {
            console.error("Error fetching suggested drinks:", error)
          })
          .finally(() => {
            setIsLoadingSuggestedDrinks(false)
          })
      } else {
        setSuggestedDrinks([])
        setIsLoadingSuggestedDrinks(false)
      }

      // Check wishlist status
      if (foodItem._id && token) {
        checkWishlistStatus(foodItem._id)
      }
    } else {
      console.log("No foodItem found for slug:", slug)
      setIsLoadingStock(false)
    }
  }, [foodItem, food_list, slug, url, token, fetchRatingsForProducts, fetchProductStock])

  // Update rating stats when relatedRatings changes
  useEffect(() => {
    if (foodItem && relatedRatings[foodItem._id]) {
      setRatingStats(relatedRatings[foodItem._id])
    }
  }, [relatedRatings, foodItem])

  // Debug effect to log stock changes
  useEffect(() => {
    console.log("📊 Stock state changed:", {
      stock,
      isLoadingStock,
      stockError,
      foodItem
    })
  }, [stock, isLoadingStock, stockError, foodItem])

  const checkWishlistStatus = async (foodId) => {
    if (!token) return

    try {
      console.log("Checking wishlist status for foodId:", foodId, "with token:", token)

      const response = await axios.get(`${url}/api/wishlist/check/${foodId}`, {
        headers: { token },
      })

      console.log("Wishlist check response:", response.data)

      if (response.data.success) {
        setIsInWishlist(response.data.isInWishlist)
      } else {
        console.error("Failed to check wishlist status:", response.data.message)
      }
    } catch (error) {
      console.error("Error checking wishlist status:", error)
    }
  }

  const handleAddToCart = () => {
    if (foodItem) {
      if (stock <= 0) {
        toast.error("Sản phẩm đã hết hàng")
        return
      }

      if (quantity > stock) {
        toast.error(`Chỉ còn ${stock} sản phẩm trong kho`)
        return
      }

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
      if (stock <= 0) {
        toast.error("Sản phẩm đã hết hàng")
        return
      }

      if (quantity > stock) {
        toast.error(`Chỉ còn ${stock} sản phẩm trong kho`)
        return
      }

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
    if (quantity < stock) {
      setQuantity((prev) => prev + 1)
    } else {
      toast.warning("Không thể thêm quá số lượng có sẵn trong kho")
    }
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
    ratingStats,
    suggestedDrinks,
    isLoadingSuggestedDrinks,
    stock,
    isLoadingStock,
    stockError,
    refetchStock: fetchProductStock,
    handleAddToCart,
    handleBuyNow,
    increaseQuantity,
    decreaseQuantity,
    toggleWishlist,
  }
}
