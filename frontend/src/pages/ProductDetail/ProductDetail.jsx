"use client"
import { useContext } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { StoreContext } from "../../context/StoreContext"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
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
  const navigate = useNavigate()
  const { url, user, token } = useContext(StoreContext)
  const {
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
  } = useProductDetail(slug)
  const {
    showReviewForm,
    setShowReviewForm,
    reviews,
    isLoadingReviews,
    editingCommentId,
    reviewEligibility,
    isCheckingEligibility,
    handleReviewSubmitted,
    handleWriteReview,
    handleEditComment,
    handleSaveEdit,
    handleCancelEdit,
  } = useReviews(foodItem)
  // Nếu không tìm thấy sản phẩm
  if (!foodItem) {
    return <ProductNotFound />
  }
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
              handleAddToCart={handleAddToCart}
              ratingStats={ratingStats}
              suggestedDrinks={suggestedDrinks}
              isLoadingSuggestedDrinks={isLoadingSuggestedDrinks}
              relatedRatings={relatedRatings}
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
        {/* Related Products */}
        <RelatedProducts
          relatedProducts={relatedProducts}
          url={url}
          relatedRatings={relatedRatings}
          navigate={navigate}
          addToCart={handleAddToCart}
        />
      </div>
      <ToastContainer />\
    </div>
  )
}
export default ProductDetail
