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

  // Debug logs
  console.log("useProductDetail - received slug:", slug)
  console.log("useProductDetail - slug type:", typeof slug)
  console.log("useProductDetail - food_list length:", food_list?.length)

  // Find food item by slug - with better error handling
  const foodItem = food_list?.find((item) => {
    if (!slug || slug === "undefined" || !item?.name) {
      return false
    }

    const match = compareNameWithSlug(item.name, slug)
    console.log(`Comparing "${item.name}" with slug "${slug}":`, match)
    return match
  })

  console.log("useProductDetail - foodItem found:", foodItem)

  const fetchRatingsForProducts = useCallback(
    async (productIds) => {
      if (productIds.length === 0) return

      try {
        const response = await axios.post(`${url}/api/comment/get-ratings`, { foodIds: productIds })
        if (response.data.success) {
          const newRatingsMap = {}
          response.data.ratings.forEach((r) => {
            newRatingsMap[r.foodId] = {
              rating: r.averageRating,
              totalReviews: r.totalReviews,
            }
          })
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

  useEffect(() => {
    window.scrollTo(0, 0)

    // Check if we have valid slug and food_list
    if (!slug || slug === "undefined") {
      console.log("Invalid slug:", slug)
      return
    }

    if (!food_list || food_list.length === 0) {
      console.log("Food list not loaded yet, waiting...")
      return
    }

    if (foodItem) {
      console.log("Processing foodItem:", foodItem)

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
            console.log("Suggested drinks response:", response.data)
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
            toast.error("Không thể tải gợi ý đồ uống.")
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
    }
  }, [foodItem, food_list, slug, url, token, fetchRatingsForProducts, relatedRatings])

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
    ratingStats,
    suggestedDrinks,
    isLoadingSuggestedDrinks,
    handleAddToCart,
    handleBuyNow,
    increaseQuantity,
    decreaseQuantity,
    toggleWishlist,
  }
}
