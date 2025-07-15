"use client"

import { useContext } from "react"
import { useParams } from "react-router-dom"
import { StoreContext } from "../../context/StoreContext"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { motion } from "framer-motion" // Import motion for animations

import { useProductDetail } from "../../hooks/useProductDetail"
import { useReviews } from "../../hooks/useReviews"

import Breadcrumb from "../../components/product/Breadcrumb"
import ProductNotFound from "../../components/product/ProductNotFound"
import ProductImageGallery from "../../components/product/ProductImageGallery"
import ProductInfo from "../../components/product/ProductInfo"
import ProductTabs from "../../components/product/ProductTabs"
import RelatedProducts from "../../components/product/RelatedProducts"

const ProductDetail = () => {
  const { slug } = useParams()
  const { url, user, token, addToCart } = useContext(StoreContext)

  const {
    foodItem,
    quantity,
    activeTab,
    setActiveTab,
    relatedProducts,
    isInWishlist,
    relatedRatings,
    suggestedDrink, // Get suggested drink from hook
    handleAddToCart, // Use the original handleAddToCart from the hook
    handleBuyNow,
    increaseQuantity,
    decreaseQuantity,
    toggleWishlist,
  } = useProductDetail(slug)

  const {
    showReviewForm,
    setShowReviewForm,
    reviews,
    isLoadingReviews,
    ratingStats,
    editingCommentId,
    reviewEligibility,
    isCheckingEligibility,
    handleWriteReview,
    handleReviewSubmitted,
    handleEditComment,
    handleSaveEdit,
    handleCancelEdit,
  } = useReviews(foodItem)

  // Nếu không tìm thấy sản phẩm
  if (!foodItem) {
    return <ProductNotFound />
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

  // Breadcrumb items
  const breadcrumbItems = [
    { label: "Trang chủ", link: "/" },
    { label: "Thực đơn", link: "/foods" },
    { label: foodItem.name },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-20 pb-16">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <Breadcrumb items={breadcrumbItems} />

        {/* Product Detail Section */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl overflow-hidden shadow-2xl mb-12 border border-slate-700">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 lg:p-8">
            {/* Product Images */}
            <ProductImageGallery
              images={productImages}
              productName={foodItem.name}
              isInWishlist={isInWishlist}
              toggleWishlist={toggleWishlist}
              ratingStats={ratingStats}
            />

            {/* Product Info */}
            <ProductInfo
              product={foodItem}
              quantity={quantity}
              increaseQuantity={increaseQuantity}
              decreaseQuantity={decreaseQuantity}
              handleBuyNow={handleBuyNow}
              handleAddToCart={handleAddToCart} // Pass the handleAddToCart from the hook
              ratingStats={ratingStats}
            />
          </div>

          {/* Product Tabs */}
          <ProductTabs
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            foodItem={foodItem}
            productDetails={productDetails}
            ratingStats={ratingStats}
            showReviewForm={showReviewForm}
            handleReviewSubmitted={handleReviewSubmitted}
            setShowReviewForm={setShowReviewForm}
            isCheckingEligibility={isCheckingEligibility}
            reviewEligibility={reviewEligibility}
            handleWriteReview={handleWriteReview}
            isLoadingReviews={isLoadingReviews}
            reviews={reviews}
            token={token}
            user={user}
            editingCommentId={editingCommentId}
            handleEditComment={handleEditComment}
            handleSaveEdit={handleSaveEdit}
            handleCancelEdit={handleCancelEdit}
            url={url}
          />
        </div>

        {/* Suggested Drink Section */}
        {suggestedDrink && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
            className="bg-slate-800/50 backdrop-blur-xl rounded-2xl shadow-2xl p-6 lg:p-8 mb-12 border border-yellow-500/50 flex flex-col md:flex-row items-center gap-6"
          >
            <div className="flex-shrink-0">
              <img
                src={url + "/images/" + suggestedDrink.image || "/placeholder.svg"}
                alt={suggestedDrink.name}
                className="w-24 h-24 object-cover rounded-lg border border-yellow-500/30 shadow-md"
              />
            </div>
            <div className="flex-grow text-center md:text-left">
              <h3 className="text-xl font-semibold text-yellow-400 mb-2">Gợi ý đồ uống kèm theo:</h3>
              <p className="text-gray-200 text-lg font-medium">
                {suggestedDrink.name} -{" "}
                <span className="text-yellow-300">{suggestedDrink.price.toLocaleString("vi-VN")} đ</span>
              </p>
            </div>
            <div className="flex-shrink-0">
              <button
                onClick={() => addToCart(suggestedDrink.name, 1)} // Call addToCart directly from StoreContext
                className="bg-yellow-500 text-zinc-900 font-bold py-3 px-6 rounded-full shadow-lg hover:bg-yellow-600 transition-all duration-300 ease-in-out transform hover:scale-105 flex items-center gap-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-plus-circle"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M8 12h8" />
                  <path d="M12 8v8" />
                </svg>
                Thêm {suggestedDrink.name}
              </button>
            </div>
          </motion.div>
        )}

        {/* Related Products */}
        <RelatedProducts
          relatedProducts={relatedProducts}
          url={url}
          relatedRatings={relatedRatings}
          navigate={useParams}
          addToCart={handleAddToCart} // Pass the handleAddToCart from the hook
        />
      </div>
      <ToastContainer />
    </div>
  )
}

export default ProductDetail
