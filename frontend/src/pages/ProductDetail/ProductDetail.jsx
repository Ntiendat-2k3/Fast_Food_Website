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
  Eye,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
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
  const [imageLoaded, setImageLoaded] = useState(false)

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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex justify-center items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center p-8 max-w-md bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700"
        >
          <div className="text-primary text-6xl mb-6 font-bold">404</div>
          <h2 className="text-3xl font-bold text-white mb-4">Không tìm thấy sản phẩm</h2>
          <p className="text-gray-300 mb-8 leading-relaxed">Sản phẩm bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
          <motion.button
            onClick={() => navigate("/foods")}
            className="bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-slate-900 py-3 px-8 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-primary/30"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Quay lại thực đơn
          </motion.button>
        </motion.div>
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-20 pb-16">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <motion.nav initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex py-4 text-sm">
          <ol className="flex items-center space-x-1">
            <li>
              <a href="/" className="text-gray-400 hover:text-primary transition-colors">
                Trang chủ
              </a>
            </li>
            <li className="flex items-center">
              <ChevronRight size={16} className="text-gray-500 mx-1" />
              <a href="/foods" className="text-gray-400 hover:text-primary transition-colors">
                Thực đơn
              </a>
            </li>
            <li className="flex items-center">
              <ChevronRight size={16} className="text-gray-500 mx-1" />
              <span className="text-white font-medium">{foodItem.name}</span>
            </li>
          </ol>
        </motion.nav>

        {/* Product Detail Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-800/50 backdrop-blur-xl rounded-2xl overflow-hidden shadow-2xl mb-12 border border-slate-700"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 lg:p-8">
            {/* Product Images */}
            <div>
              <div className="relative h-64 sm:h-80 lg:h-96 mb-4 rounded-xl overflow-hidden bg-slate-700/50">
                {!imageLoaded && (
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-700/50 to-slate-600/50 animate-pulse flex items-center justify-center">
                    <div className="w-12 h-12 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}

                <motion.img
                  key={activeImage}
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  src={productImages[activeImage]}
                  alt={foodItem.name}
                  className={`w-full h-full object-cover transition-all duration-700 ${
                    imageLoaded ? "opacity-100" : "opacity-0"
                  }`}
                  onLoad={() => setImageLoaded(true)}
                />

                {/* Action Buttons Overlay */}
                <div className="absolute top-4 right-4 flex space-x-2">
                  <motion.button
                    onClick={toggleWishlist}
                    className={`p-3 rounded-full backdrop-blur-sm border border-white/20 transition-all duration-300 ${
                      isInWishlist ? "bg-red-500/80 text-white" : "bg-black/30 text-white hover:bg-red-500/50"
                    }`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Heart size={20} className={isInWishlist ? "fill-current" : ""} />
                  </motion.button>
                  <motion.button
                    className="p-3 rounded-full bg-black/30 backdrop-blur-sm text-white border border-white/20 hover:bg-primary/50 transition-all duration-300"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Share2 size={20} />
                  </motion.button>
                </div>

                {/* Rating Badge */}
                {ratingStats.totalReviews > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="absolute top-4 left-4 bg-black/30 backdrop-blur-sm rounded-full px-3 py-2 border border-white/20"
                  >
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-primary fill-primary mr-1" />
                      <span className="text-sm font-bold text-white">{ratingStats.averageRating.toFixed(1)}</span>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Image Thumbnails */}
              <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
                {productImages.map((image, index) => (
                  <motion.div
                    key={index}
                    onClick={() => setActiveImage(index)}
                    className={`cursor-pointer rounded-lg overflow-hidden w-16 h-16 sm:w-20 sm:h-20 border-2 flex-shrink-0 transition-all duration-300 ${
                      activeImage === index
                        ? "border-primary shadow-lg shadow-primary/30"
                        : "border-slate-600 hover:border-slate-500"
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <img
                      src={image || "/placeholder.svg"}
                      alt={`${foodItem.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              {/* Rating and Reviews */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center flex-wrap gap-4"
              >
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={18}
                      className={
                        i < Math.floor(ratingStats.averageRating) ? "text-primary fill-primary" : "text-gray-500"
                      }
                    />
                  ))}
                </div>
                <span className="text-gray-300 text-sm">
                  {ratingStats.totalReviews > 0
                    ? `${ratingStats.averageRating.toFixed(1)} (${ratingStats.totalReviews} đánh giá)`
                    : "Chưa có đánh giá"}
                </span>
                <span className="text-green-400 text-sm flex items-center bg-green-500/10 px-2 py-1 rounded-full">
                  <Check size={14} className="mr-1" /> Đã bán 120+
                </span>
              </motion.div>

              {/* Product Name */}
              <motion.h1
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="text-3xl lg:text-4xl font-bold text-white leading-tight"
              >
                {foodItem.name}
              </motion.h1>

              {/* Price */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="flex items-center gap-4"
              >
                <span className="text-3xl lg:text-4xl font-bold text-primary">
                  {foodItem.price.toLocaleString("vi-VN")} đ
                </span>
                {Math.random() > 0.5 && (
                  <span className="text-xl text-gray-500 line-through">
                    {(foodItem.price * 1.2).toFixed(0).toLocaleString("vi-VN")} đ
                  </span>
                )}
              </motion.div>

              {/* Description */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-slate-700/50 p-4 rounded-xl border border-slate-600"
              >
                <p className="text-gray-300 leading-relaxed">{foodItem.description}</p>
              </motion.div>

              {/* Quantity Selector */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="space-y-3"
              >
                <div className="flex items-center justify-between">
                  <label className="text-white font-medium">Số lượng</label>
                  <span className="text-green-400 text-sm bg-green-500/10 px-2 py-1 rounded-full">Còn hàng</span>
                </div>
                <div className="flex items-center bg-slate-700/50 rounded-xl border border-slate-600 w-fit">
                  <motion.button
                    onClick={decreaseQuantity}
                    className="w-12 h-12 flex items-center justify-center text-white hover:text-primary transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Minus size={18} />
                  </motion.button>
                  <div className="w-16 h-12 flex items-center justify-center text-white font-semibold">{quantity}</div>
                  <motion.button
                    onClick={increaseQuantity}
                    className="w-12 h-12 flex items-center justify-center text-white hover:text-primary transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Plus size={18} />
                  </motion.button>
                </div>
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              >
                <motion.button
                  onClick={handleBuyNow}
                  className="bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-slate-900 py-4 px-6 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-primary/30"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <CreditCard size={20} />
                  Mua ngay
                </motion.button>
                <motion.button
                  onClick={handleAddToCart}
                  className="border-2 border-primary text-primary hover:bg-primary hover:text-slate-900 py-4 px-6 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <ShoppingCart size={20} />
                  Thêm vào giỏ
                </motion.button>
              </motion.div>

              {/* Features */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 }}
                className="grid grid-cols-1 sm:grid-cols-3 gap-4"
              >
                <div className="flex items-center bg-slate-700/30 p-3 rounded-xl">
                  <div className="p-2 bg-primary/20 rounded-full mr-3">
                    <Truck size={18} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Giao hàng miễn phí</p>
                    <p className="text-xs text-gray-400">Cho đơn từ 200k</p>
                  </div>
                </div>
                <div className="flex items-center bg-slate-700/30 p-3 rounded-xl">
                  <div className="p-2 bg-primary/20 rounded-full mr-3">
                    <ShieldCheck size={18} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Đảm bảo chất lượng</p>
                    <p className="text-xs text-gray-400">100% nguyên liệu sạch</p>
                  </div>
                </div>
                <div className="flex items-center bg-slate-700/30 p-3 rounded-xl">
                  <div className="p-2 bg-primary/20 rounded-full mr-3">
                    <RefreshCw size={18} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Đổi trả dễ dàng</p>
                    <p className="text-xs text-gray-400">Trong vòng 24h</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Product Tabs */}
          <div className="border-t border-slate-700">
            <div className="flex overflow-x-auto scrollbar-hide bg-slate-800/30">
              {[
                { id: "description", label: "Mô tả chi tiết" },
                { id: "specifications", label: "Thông tin sản phẩm" },
                { id: "reviews", label: `Đánh giá (${ratingStats.totalReviews})` },
              ].map((tab) => (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-4 font-medium text-sm whitespace-nowrap transition-all duration-300 ${
                    activeTab === tab.id
                      ? "border-b-2 border-primary text-primary bg-primary/10"
                      : "text-gray-400 hover:text-white"
                  }`}
                  whileHover={{ y: -2 }}
                >
                  {tab.label}
                </motion.button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="p-6"
              >
                {activeTab === "description" && (
                  <div className="prose prose-invert max-w-none">
                    <h3 className="text-2xl font-bold text-white mb-4">Giới thiệu về {foodItem.name}</h3>
                    <p className="text-gray-300 leading-relaxed mb-4">
                      {foodItem.description} Được chế biến từ những nguyên liệu tươi ngon nhất, đảm bảo mang đến cho bạn
                      trải nghiệm ẩm thực tuyệt vời nhất.
                    </p>
                    <p className="text-gray-300 leading-relaxed mb-6">
                      Món ăn này được đầu bếp của chúng tôi chế biến theo công thức truyền thống, kết hợp với kỹ thuật
                      hiện đại để tạo ra hương vị độc đáo, khó quên.
                    </p>
                    <h4 className="text-xl font-semibold text-white mb-3">Đặc điểm nổi bật</h4>
                    <ul className="space-y-2 text-gray-300">
                      <li className="flex items-center">
                        <Check size={16} className="text-primary mr-2" />
                        Nguyên liệu tươi sạch, được lựa chọn kỹ lưỡng
                      </li>
                      <li className="flex items-center">
                        <Check size={16} className="text-primary mr-2" />
                        Chế biến theo công thức độc quyền
                      </li>
                      <li className="flex items-center">
                        <Check size={16} className="text-primary mr-2" />
                        Không sử dụng chất bảo quản
                      </li>
                      <li className="flex items-center">
                        <Check size={16} className="text-primary mr-2" />
                        Đóng gói cẩn thận, giữ nguyên hương vị
                      </li>
                    </ul>
                  </div>
                )}

                {activeTab === "specifications" && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-slate-700/30 rounded-xl p-6 border border-slate-600">
                      <h3 className="text-xl font-semibold text-white mb-6">Thông tin chi tiết</h3>
                      <div className="space-y-4">
                        {[
                          { label: "Khối lượng", value: productDetails.weight },
                          { label: "Thành phần", value: productDetails.ingredients },
                          { label: "Xuất xứ", value: productDetails.origin },
                          { label: "Hạn sử dụng", value: productDetails.expiry },
                          { label: "Bảo quản", value: productDetails.storage },
                        ].map((item, index) => (
                          <div key={index} className="flex justify-between items-start border-b border-slate-600 pb-3">
                            <span className="text-gray-400 font-medium">{item.label}</span>
                            <span className="text-white text-right max-w-xs">{item.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-slate-700/30 rounded-xl p-6 border border-slate-600">
                      <h3 className="text-xl font-semibold text-white mb-6">Thông tin dinh dưỡng</h3>
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        {Object.entries(productDetails.nutrition).map(([key, value], index) => (
                          <div key={index} className="bg-slate-800/50 p-3 rounded-lg text-center">
                            <p className="text-gray-400 text-sm capitalize">{key}</p>
                            <p className="font-semibold text-white">{value}</p>
                          </div>
                        ))}
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center text-gray-300">
                          <Info size={16} className="text-primary mr-2" />
                          <span className="text-sm">Thông tin dinh dưỡng chỉ mang tính chất tham khảo</span>
                        </div>
                        <div className="flex items-center text-gray-300">
                          <Clock size={16} className="text-primary mr-2" />
                          <span className="text-sm">Thời gian chuẩn bị: 15-20 phút</span>
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
                        <h3 className="text-xl font-semibold text-white">Đánh giá từ khách hàng</h3>
                        <motion.button
                          onClick={handleWriteReview}
                          className="bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-slate-900 py-2 px-4 rounded-lg font-semibold transition-all duration-300"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Viết đánh giá
                        </motion.button>
                      </div>
                    )}

                    {isLoadingReviews ? (
                      <div className="flex justify-center py-12">
                        <div className="w-12 h-12 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    ) : reviews.length > 0 ? (
                      <div className="space-y-6">
                        {reviews.map((review, index) => (
                          <motion.div
                            key={review._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-slate-700/30 rounded-xl p-6 border border-slate-600"
                          >
                            <div className="flex items-start">
                              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-slate-900 font-bold mr-4">
                                {review.userName ? review.userName.charAt(0).toUpperCase() : "U"}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className="font-semibold text-white">{review.userName}</h4>
                                  <div className="flex items-center space-x-3">
                                    <span className="text-sm text-gray-400">
                                      {new Date(review.createdAt).toLocaleDateString("vi-VN")}
                                      {review.updatedAt && <span className="ml-1 text-xs">(đã chỉnh sửa)</span>}
                                    </span>
                                    {token && user && review.userId === user._id && (
                                      <motion.button
                                        onClick={() => handleEditComment(review._id)}
                                        className="text-xs text-primary hover:text-primary-dark transition-colors px-2 py-1 rounded border border-primary hover:bg-primary hover:text-slate-900"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                      >
                                        ✏️ Sửa
                                      </motion.button>
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
                                    <div className="flex mb-3">
                                      {[...Array(5)].map((_, i) => (
                                        <Star
                                          key={i}
                                          size={16}
                                          className={i < review.rating ? "text-primary fill-primary" : "text-gray-500"}
                                        />
                                      ))}
                                    </div>
                                    <p className="text-gray-300 leading-relaxed">{review.comment}</p>

                                    {/* Admin Reply */}
                                    {review.adminReply && review.adminReply.message && (
                                      <div className="mt-4 bg-green-500/10 border border-green-500/30 p-4 rounded-lg">
                                        <p className="text-sm font-medium text-green-400 mb-1">
                                          Phản hồi từ quản trị viên:
                                        </p>
                                        <p className="text-green-300 text-sm">{review.adminReply.message}</p>
                                        <p className="text-xs text-gray-400 mt-2">
                                          {new Date(review.adminReply.createdAt).toLocaleDateString("vi-VN")}
                                        </p>
                                      </div>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 border-2 border-dashed border-slate-600 rounded-xl">
                        <div className="mb-4">
                          <Star size={48} className="text-gray-500 mx-auto mb-4" />
                          <p className="text-gray-400 mb-4">Chưa có đánh giá nào cho sản phẩm này</p>
                        </div>
                        <motion.button
                          onClick={handleWriteReview}
                          className="bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-slate-900 py-3 px-6 rounded-xl font-semibold transition-all duration-300"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Hãy là người đầu tiên đánh giá
                        </motion.button>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="mb-12"
          >
            <h2 className="text-3xl font-bold text-white mb-8">Sản phẩm liên quan</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((item, index) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 + index * 0.1 }}
                  className="group bg-slate-800/50 backdrop-blur-xl rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-500 border border-slate-700 hover:border-primary/50 cursor-pointer"
                  onClick={() => navigate(`/product/${slugify(item.name)}`)}
                  whileHover={{ y: -4 }}
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={url + "/images/" + item.image || "/placeholder.svg"}
                      alt={item.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute top-2 right-2 bg-black/30 backdrop-blur-sm rounded-full p-2 border border-white/20">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-primary fill-primary" />
                        <span className="text-xs font-medium ml-1 text-white">
                          {relatedRatings[item._id] ? relatedRatings[item._id].toFixed(1) : "0.0"}
                        </span>
                      </div>
                    </div>

                    {/* Quick Action Button */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <motion.button
                        onClick={(e) => {
                          e.stopPropagation()
                          navigate(`/product/${slugify(item.name)}`)
                        }}
                        className="bg-primary text-slate-900 p-3 rounded-full font-semibold transition-all duration-300"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Eye size={20} />
                      </motion.button>
                    </div>
                  </div>

                  <div className="p-5">
                    <h3 className="text-lg font-bold text-white mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                      {item.name}
                    </h3>
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">{item.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold text-primary">{item.price.toLocaleString("vi-VN")} đ</span>
                      <motion.button
                        onClick={(e) => {
                          e.stopPropagation()
                          addToCart(item.name, 1)
                          toast.success("Đã thêm vào giỏ hàng", { autoClose: 2000 })
                        }}
                        className="bg-primary hover:bg-primary-dark text-slate-900 p-2 rounded-full transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <ShoppingCart size={18} />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
      <ToastContainer />
    </div>
  )
}

export default ProductDetail
