"use client"

import { useContext, useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { StoreContext } from "../../context/StoreContext"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import axios from "axios"
import { compareNameWithSlug } from "../../utils/slugify"
import {
  ShoppingCart,
  Minus,
  Plus,
  CreditCard,
  Star,
  ChevronRight,
  Truck,
  ShieldCheck,
  RefreshCw,
  Heart,
  Share2,
  Info,
  Clock,
  Check,
} from "lucide-react"
import { motion } from "framer-motion"
import { slugify } from "../../utils/slugify"
import ReviewForm from "../../components/ReviewForm"
import EditCommentForm from "../../components/EditCommentForm"

const ProductDetail = () => {
  const { slug } = useParams()
  const { cartItems, addToCart, url, user, token, userData } = useContext(StoreContext)
  const { food_list } = useContext(StoreContext)
  const navigate = useNavigate()

  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState("description")
  const [activeImage, setActiveImage] = useState(0)
  const [relatedProducts, setRelatedProducts] = useState([])
  const [isInWishlist, setIsInWishlist] = useState(false)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviews, setReviews] = useState([])
  const [isLoadingReviews, setIsLoadingReviews] = useState(false)
  const [ratingStats, setRatingStats] = useState({ averageRating: 0, totalReviews: 0 })
  const [relatedRatings, setRelatedRatings] = useState({})
  const [editingCommentId, setEditingCommentId] = useState(null)

  // Debug user data
  useEffect(() => {
    console.log("Current user:", user)
    console.log("Token:", token)
    console.log("UserData:", userData)
  }, [user, token, userData])

  // Tìm sản phẩm dựa trên slug (từ tên sản phẩm)
  const foodItem = food_list.find((item) => compareNameWithSlug(item.name, slug))

  useEffect(() => {
    window.scrollTo(0, 0)

    // Nếu tìm thấy sản phẩm, tìm các sản phẩm liên quan và lấy đánh giá
    if (foodItem) {
      const related = food_list
        .filter((item) => item.category === foodItem.category && item.name !== foodItem.name)
        .slice(0, 4)
      setRelatedProducts(related)

      // Fetch reviews and rating stats for this product
      if (foodItem._id) {
        fetchReviews(foodItem._id)
        fetchRatingStats(foodItem._id)
        checkWishlistStatus(foodItem._id)
      }

      // Fetch ratings for related products
      related.forEach((item) => {
        if (item._id) {
          fetchRelatedRating(item._id)
        }
      })
    }
  }, [foodItem, food_list, slug, token])

  const fetchReviews = async (foodId) => {
    if (!foodId) return

    try {
      setIsLoadingReviews(true)
      const response = await axios.get(`${url}/api/comment/food/${foodId}`)
      if (response.data.success) {
        setReviews(response.data.data)
      }
    } catch (error) {
      console.error("Error fetching reviews:", error)
    } finally {
      setIsLoadingReviews(false)
    }
  }

  const fetchRatingStats = async (foodId) => {
    try {
      const response = await axios.get(`${url}/api/comment/food/${foodId}/stats`)
      if (response.data.success) {
        setRatingStats(response.data.data)
      }
    } catch (error) {
      console.error("Error fetching rating stats:", error)
    }
  }

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
      addToCart(foodItem.name, quantity)
      navigate("/order")
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

  const handleReviewSubmitted = (newReview) => {
    setReviews([newReview, ...reviews])
    setShowReviewForm(false)
    setActiveTab("reviews")
    // Refresh rating stats
    if (foodItem._id) {
      fetchRatingStats(foodItem._id)
    }
  }

  const handleWriteReview = () => {
    if (!token) {
      toast.info("Vui lòng đăng nhập để viết đánh giá")
      return
    }

    if (!foodItem || !foodItem._id) {
      toast.error("Không thể xác định sản phẩm để đánh giá")
      return
    }

    setShowReviewForm(true)
    setActiveTab("reviews")
  }

  const handleEditComment = (commentId) => {
    setEditingCommentId(commentId)
  }

  const handleSaveEdit = (updatedComment) => {
    setReviews(reviews.map((review) => (review._id === updatedComment._id ? updatedComment : review)))
    setEditingCommentId(null)
    // Refresh rating stats
    if (foodItem._id) {
      fetchRatingStats(foodItem._id)
    }
  }

  const handleCancelEdit = () => {
    setEditingCommentId(null)
  }

  // Nếu không tìm thấy sản phẩm
  if (!foodItem) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center p-8 max-w-md">
          <div className="text-primary text-5xl mb-4">404</div>
          <h2 className="text-2xl font-bold text-dark dark:text-white mb-4">Không tìm thấy sản phẩm</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Sản phẩm bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
          </p>
          <button
            onClick={() => navigate("/foods")}
            className="bg-primary hover:bg-primary-light text-dark py-2 px-6 rounded-lg transition-colors"
          >
            Quay lại thực đơn
          </button>
        </div>
      </div>
    )
  }

  // Tạo mảng hình ảnh giả lập (trong thực tế sẽ lấy từ API)
  const productImages = [
    url + "/images/" + foodItem.image,
    "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1565958011703-44f9829ba187?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80",
  ]

  // Thông tin chi tiết sản phẩm (giả lập)
  const productDetails = {
    weight: "300g",
    ingredients: "Bột mì, trứng, sữa, đường, muối, dầu ăn, men nở",
    origin: "Việt Nam",
    expiry: "3 ngày kể từ ngày sản xuất",
    storage: "Bảo quản ở nhiệt độ phòng hoặc tủ lạnh",
    nutrition: {
      calories: "350 kcal",
      protein: "8g",
      carbs: "45g",
      fat: "12g",
      sugar: "15g",
      sodium: "380mg",
    },
  }

  return (
    <div className="pt-20 pb-16">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="flex py-4 text-sm">
          <ol className="flex items-center space-x-1">
            <li>
              <a href="/" className="text-gray-500 dark:text-gray-400 hover:text-primary">
                Trang chủ
              </a>
            </li>
            <li className="flex items-center">
              <ChevronRight size={16} className="text-gray-400" />
              <a href="/foods" className="text-gray-500 dark:text-gray-400 hover:text-primary ml-1">
                Thực đơn
              </a>
            </li>
            <li className="flex items-center">
              <ChevronRight size={16} className="text-gray-400" />
              <span className="text-dark dark:text-white ml-1 font-medium">{foodItem.name}</span>
            </li>
          </ol>
        </nav>

        {/* Product Detail Section */}
        <div className="bg-white dark:bg-dark-light rounded-xl overflow-hidden shadow-lg mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-4 sm:p-6 md:p-8">
            {/* Product Images */}
            <div>
              <div className="relative h-64 sm:h-80 md:h-96 mb-4 rounded-lg overflow-hidden">
                <motion.img
                  key={activeImage}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  src={productImages[activeImage]}
                  alt={foodItem.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4 flex space-x-2">
                  <button
                    onClick={toggleWishlist}
                    className={`p-2 rounded-full transition-colors ${
                      isInWishlist
                        ? "bg-red-500 text-white"
                        : "bg-white dark:bg-dark-light text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20"
                    }`}
                  >
                    <Heart size={20} className={isInWishlist ? "fill-current" : ""} />
                  </button>
                  <button className="p-2 rounded-full bg-white dark:bg-dark-light text-gray-700 dark:text-gray-300">
                    <Share2 size={20} />
                  </button>
                </div>
              </div>
              <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
                {productImages.map((image, index) => (
                  <div
                    key={index}
                    onClick={() => setActiveImage(index)}
                    className={`cursor-pointer rounded-md overflow-hidden w-16 h-16 sm:w-20 sm:h-20 border-2 flex-shrink-0 ${activeImage === index ? "border-primary" : "border-transparent"}`}
                  >
                    <img
                      src={image || "/placeholder.svg"}
                      alt={`${foodItem.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div className="px-1 sm:px-0">
              <div className="flex items-center mb-2 flex-wrap">
                <div className="flex mr-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={18}
                      className={
                        i < Math.floor(ratingStats.averageRating)
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-gray-300 dark:text-gray-600"
                      }
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-300 mr-2">
                  {ratingStats.totalReviews > 0
                    ? `${ratingStats.averageRating.toFixed(1)} (${ratingStats.totalReviews} đánh giá)`
                    : "Chưa có đánh giá"}
                </span>
                <span className="text-sm text-green-600 dark:text-green-400 flex items-center mt-1 sm:mt-0">
                  <Check size={16} className="mr-1" /> Đã bán 120+
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold text-dark dark:text-white mb-2">{foodItem.name}</h1>

              <div className="mb-4">
                <span className="text-2xl sm:text-3xl font-bold text-primary mr-3">
                  {foodItem.price.toLocaleString("vi-VN")} đ
                </span>
                {Math.random() > 0.5 && (
                  <span className="text-lg sm:text-xl text-gray-400 line-through">
                    {(foodItem.price * 1.2).toFixed(0).toLocaleString("vi-VN")} đ
                  </span>
                )}
              </div>

              <div className="bg-gray-50 dark:bg-dark-light p-3 sm:p-4 rounded-lg mb-6">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{foodItem.description}</p>
              </div>

              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-dark dark:text-gray-300 font-medium">Số lượng</label>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Còn hàng</span>
                </div>
                <div className="flex items-center">
                  <button
                    onClick={decreaseQuantity}
                    className="w-10 h-10 rounded-l-lg bg-gray-100 dark:bg-dark-light text-dark dark:text-white flex items-center justify-center hover:bg-primary transition-colors"
                  >
                    <Minus size={18} />
                  </button>
                  <div className="w-16 h-10 bg-gray-100 dark:bg-dark-light flex items-center justify-center text-dark dark:text-white font-medium">
                    {quantity}
                  </div>
                  <button
                    onClick={increaseQuantity}
                    className="w-10 h-10 rounded-r-lg bg-gray-100 dark:bg-dark-light text-dark dark:text-white flex items-center justify-center hover:bg-primary transition-colors"
                  >
                    <Plus size={18} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <button
                  onClick={handleBuyNow}
                  className="bg-primary hover:bg-primary-light text-dark py-3 px-6 rounded-lg flex items-center justify-center transition-colors"
                >
                  <CreditCard size={20} className="mr-2" />
                  Mua ngay
                </button>
                <button
                  onClick={handleAddToCart}
                  className="border border-primary text-primary dark:text-primary-lighter hover:bg-primary hover:text-dark py-3 px-6 rounded-lg flex items-center justify-center transition-colors"
                >
                  <ShoppingCart size={20} className="mr-2" />
                  Thêm vào giỏ
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex items-center">
                  <div className="p-2 bg-primary/10 rounded-full mr-3">
                    <Truck size={20} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-dark dark:text-white">Giao hàng miễn phí</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Cho đơn từ 200k</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="p-2 bg-primary/10 rounded-full mr-3">
                    <ShieldCheck size={20} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-dark dark:text-white">Đảm bảo chất lượng</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">100% nguyên liệu sạch</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="p-2 bg-primary/10 rounded-full mr-3">
                    <RefreshCw size={20} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-dark dark:text-white">Đổi trả dễ dàng</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Trong vòng 24h</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Product Tabs */}
          <div className="border-t border-gray-200 dark:border-dark-lighter">
            <div className="flex overflow-x-auto scrollbar-hide">
              <button
                onClick={() => setActiveTab("description")}
                className={`px-6 py-4 font-medium text-sm whitespace-nowrap ${
                  activeTab === "description"
                    ? "border-b-2 border-primary text-primary"
                    : "text-gray-600 dark:text-gray-300"
                }`}
              >
                Mô tả chi tiết
              </button>
              <button
                onClick={() => setActiveTab("specifications")}
                className={`px-6 py-4 font-medium text-sm whitespace-nowrap ${
                  activeTab === "specifications"
                    ? "border-b-2 border-primary text-primary"
                    : "text-gray-600 dark:text-gray-300"
                }`}
              >
                Thông tin sản phẩm
              </button>
              <button
                onClick={() => setActiveTab("reviews")}
                className={`px-6 py-4 font-medium text-sm whitespace-nowrap ${
                  activeTab === "reviews"
                    ? "border-b-2 border-primary text-primary"
                    : "text-gray-600 dark:text-gray-300"
                }`}
              >
                Đánh giá ({ratingStats.totalReviews})
              </button>
            </div>

            <div className="p-6">
              {activeTab === "description" && (
                <div className="prose max-w-none dark:prose-invert prose-headings:text-dark dark:prose-headings:text-white prose-p:text-gray-600 dark:prose-p:text-gray-300">
                  <h3>Giới thiệu về {foodItem.name}</h3>
                  <p>
                    {foodItem.description} Được chế biến từ những nguyên liệu tươi ngon nhất, đảm bảo mang đến cho bạn
                    trải nghiệm ẩm thực tuyệt vời nhất.
                  </p>
                  <p>
                    Món ăn này được đầu bếp của chúng tôi chế biến theo công thức truyền thống, kết hợp với kỹ thuật
                    hiện đại để tạo ra hương vị độc đáo, khó quên.
                  </p>
                  <h4>Đặc điểm nổi bật</h4>
                  <ul>
                    <li>Nguyên liệu tươi sạch, được lựa chọn kỹ lưỡng</li>
                    <li>Chế biến theo công thức độc quyền</li>
                    <li>Không sử dụng chất bảo quản</li>
                    <li>Đóng gói cẩn thận, giữ nguyên hương vị</li>
                  </ul>
                </div>
              )}

              {activeTab === "specifications" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-medium text-dark dark:text-white mb-4">Thông tin chi tiết</h3>
                    <table className="w-full">
                      <tbody>
                        <tr className="border-b border-gray-200 dark:border-dark-lighter">
                          <td className="py-3 text-gray-600 dark:text-gray-400">Khối lượng</td>
                          <td className="py-3 text-dark dark:text-white">{productDetails.weight}</td>
                        </tr>
                        <tr className="border-b border-gray-200 dark:border-dark-lighter">
                          <td className="py-3 text-gray-600 dark:text-gray-400">Thành phần</td>
                          <td className="py-3 text-dark dark:text-white">{productDetails.ingredients}</td>
                        </tr>
                        <tr className="border-b border-gray-200 dark:border-dark-lighter">
                          <td className="py-3 text-gray-600 dark:text-gray-400">Xuất xứ</td>
                          <td className="py-3 text-dark dark:text-white">{productDetails.origin}</td>
                        </tr>
                        <tr className="border-b border-gray-200 dark:border-dark-lighter">
                          <td className="py-3 text-gray-600 dark:text-gray-400">Hạn sử dụng</td>
                          <td className="py-3 text-dark dark:text-white">{productDetails.expiry}</td>
                        </tr>
                        <tr>
                          <td className="py-3 text-gray-600 dark:text-gray-400">Bảo quản</td>
                          <td className="py-3 text-dark dark:text-white">{productDetails.storage}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-dark dark:text-white mb-4">Thông tin dinh dưỡng</h3>
                    <div className="bg-gray-50 dark:bg-dark-light rounded-lg p-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="border-b border-gray-200 dark:border-dark-lighter pb-2">
                          <p className="text-sm text-gray-500 dark:text-gray-400">Calories</p>
                          <p className="font-medium text-dark dark:text-white">{productDetails.nutrition.calories}</p>
                        </div>
                        <div className="border-b border-gray-200 dark:border-dark-lighter pb-2">
                          <p className="text-sm text-gray-500 dark:text-gray-400">Protein</p>
                          <p className="font-medium text-dark dark:text-white">{productDetails.nutrition.protein}</p>
                        </div>
                        <div className="border-b border-gray-200 dark:border-dark-lighter pb-2">
                          <p className="text-sm text-gray-500 dark:text-gray-400">Carbs</p>
                          <p className="font-medium text-dark dark:text-white">{productDetails.nutrition.carbs}</p>
                        </div>
                        <div className="border-b border-gray-200 dark:border-dark-lighter pb-2">
                          <p className="text-sm text-gray-500 dark:text-gray-400">Chất béo</p>
                          <p className="font-medium text-dark dark:text-white">{productDetails.nutrition.fat}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Đường</p>
                          <p className="font-medium text-dark dark:text-white">{productDetails.nutrition.sugar}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Natri</p>
                          <p className="font-medium text-dark dark:text-white">{productDetails.nutrition.sodium}</p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-6">
                      <div className="flex items-center mb-2">
                        <Info size={18} className="text-primary mr-2" />
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Thông tin dinh dưỡng chỉ mang tính chất tham khảo
                        </p>
                      </div>
                      <div className="flex items-center">
                        <Clock size={18} className="text-primary mr-2" />
                        <p className="text-sm text-gray-600 dark:text-gray-300">Thời gian chuẩn bị: 15-20 phút</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "reviews" && (
                <div>
                  {showReviewForm ? (
                    <ReviewForm
                      foodId={foodItem._id}
                      onReviewSubmitted={handleReviewSubmitted}
                      onCancel={() => setShowReviewForm(false)}
                    />
                  ) : (
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-medium text-dark dark:text-white">Đánh giá từ khách hàng</h3>
                      <button
                        onClick={handleWriteReview}
                        className="bg-primary hover:bg-primary-light text-dark py-2 px-4 rounded-lg text-sm transition-colors"
                      >
                        Viết đánh giá
                      </button>
                    </div>
                  )}

                  {isLoadingReviews ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                    </div>
                  ) : reviews.length > 0 ? (
                    <div className="space-y-6">
                      {reviews.map((review) => {
                        console.log(
                          "Review userId:",
                          review.userId,
                          "User ID:",
                          user?._id,
                          "Match:",
                          review.userId === user?._id,
                        )
                        return (
                          <div key={review._id} className="border-b border-gray-200 dark:border-dark-lighter pb-6">
                            <div className="flex items-start">
                              <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-700 dark:text-gray-300 font-medium mr-4">
                                {review.userName ? review.userName.charAt(0).toUpperCase() : "U"}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                  <h4 className="font-medium text-dark dark:text-white">{review.userName}</h4>
                                  <div className="flex items-center space-x-2">
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                      {new Date(review.createdAt).toLocaleDateString("vi-VN")}
                                      {review.updatedAt && <span className="ml-1 text-xs">(đã chỉnh sửa)</span>}
                                    </span>
                                    {/* Show edit button only for user's own comments */}
                                    {token && user && review.userId === user._id && (
                                      <button
                                        onClick={() => handleEditComment(review._id)}
                                        className="text-xs text-primary hover:text-primary-dark transition-colors px-2 py-1 rounded border border-primary hover:bg-primary hover:text-white"
                                      >
                                        ✏️ Sửa
                                      </button>
                                    )}
                                  </div>
                                </div>

                                {editingCommentId === review._id ? (
                                  <EditCommentForm
                                    comment={review}
                                    onSave={handleSaveEdit}
                                    onCancel={handleCancelEdit}
                                    url={url}
                                    token={token}
                                  />
                                ) : (
                                  <>
                                    <div className="flex mb-2">
                                      {[...Array(5)].map((_, i) => (
                                        <Star
                                          key={i}
                                          size={16}
                                          className={
                                            i < review.rating
                                              ? "text-yellow-400 fill-yellow-400"
                                              : "text-gray-300 dark:text-gray-600"
                                          }
                                        />
                                      ))}
                                    </div>
                                    <p className="text-gray-600 dark:text-gray-300">{review.comment}</p>

                                    {/* Admin Reply */}
                                    {review.adminReply && review.adminReply.message && (
                                      <div className="mt-3 bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-100 dark:border-green-800">
                                        <p className="text-sm font-medium text-green-700 dark:text-green-300 mb-1">
                                          {review.adminReply.message}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                          {new Date(review.adminReply.createdAt).toLocaleDateString("vi-VN")}
                                        </p>
                                      </div>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                      <p className="text-gray-500 dark:text-gray-400 mb-4">Chưa có đánh giá nào cho sản phẩm này</p>
                      <button
                        onClick={handleWriteReview}
                        className="bg-primary hover:bg-primary-light text-dark py-2 px-4 rounded-lg text-sm transition-colors"
                      >
                        Hãy là người đầu tiên đánh giá
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-dark dark:text-white mb-6">Sản phẩm liên quan</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((item, index) => (
                <div
                  key={item.name}
                  className="bg-white dark:bg-dark-light rounded-2xl overflow-hidden shadow-custom hover:shadow-hover transition-all hover:-translate-y-1 border border-gray-100 dark:border-dark-lighter cursor-pointer"
                  onClick={() => navigate(`/product/${slugify(item.name)}`)}
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={url + "/images/" + item.image || "/placeholder.svg"}
                      alt={item.name}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                    />
                    <div className="absolute top-2 right-2 bg-white dark:bg-dark rounded-full p-1 shadow-md">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        <span className="text-xs font-medium ml-1 text-dark dark:text-white">
                          {relatedRatings[item._id] ? relatedRatings[item._id].toFixed(1) : "0.0"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-dark dark:text-white mb-1 truncate">{item.name}</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-3 line-clamp-2">{item.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold text-primary">{item.price.toLocaleString("vi-VN")} đ</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          addToCart(item.name, 1)
                          toast.success("Đã thêm vào giỏ hàng", { autoClose: 2000 })
                        }}
                        className="bg-primary hover:bg-primary-dark text-dark p-2 rounded-full transition-colors"
                      >
                        <ShoppingCart size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <ToastContainer />
    </div>
  )
}

export default ProductDetail
