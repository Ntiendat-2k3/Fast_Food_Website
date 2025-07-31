"use client"
import { useContext, useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { StoreContext } from "../../context/StoreContext"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import Breadcrumb from "../../components/product/Breadcrumb"
import ProductNotFound from "../../components/product/ProductNotFound"
import ProductImageGallery from "../../components/product/ProductImageGallery"
import ProductInfo from "../../components/product/ProductInfo"
import ProductTabs from "../../components/product/ProductTabs"
import RelatedProducts from "../../components/product/RelatedProducts"
import SuggestedDrinks from "../../components/product/SuggestedDrinks"
import SuggestedFoods from "../../components/product/SuggestedFoods"
import { useProductDetail } from "../../hooks/useProductDetail"
import { useReviews } from "../../hooks/useReviews"
import { AlertCircle } from "lucide-react"
import axios from "axios"
import { toast } from "react-toastify"

const ProductDetail = () => {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { url, user, token, cartItems } = useContext(StoreContext)

  const [inventory, setInventory] = useState(null)
  const [inventoryLoading, setInventoryLoading] = useState(true)

  const {
    foodItem,
    quantity,
    setQuantity,
    activeTab,
    setActiveTab,
    relatedProducts,
    isInWishlist,
    relatedRatings,
    ratingStats,
    suggestedDrinks,
    isLoadingSuggestedDrinks,
    stock,
    handleAddToCart: handleAddToCartFromHook,
    handleBuyNow: handleBuyNowFromHook,
    increaseQuantity,
    decreaseQuantity,
    toggleWishlist,
  } = useProductDetail(slug)

  console.log("FoodItem:", foodItem)

  const {
    showReviewForm,
    setShowReviewForm,
    reviews,
    isLoadingReviews,
    editingRatingId,
    reviewEligibility,
    isCheckingEligibility,
    handleReviewSubmitted,
    handleWriteReview,
    handleEditRating,
    handleSaveEdit,
    handleCancelEdit,
  } = useReviews(foodItem)

  // Breadcrumb items
  const breadcrumbItems = [
    { label: "Trang chủ", link: "/" },
    { label: "Thực đơn", link: "/foods" },
    { label: foodItem ? foodItem.name : "Sản phẩm không tồn tại" },
  ]

  // Fetch inventory data
  useEffect(() => {
    const fetchInventory = async () => {
      if (foodItem && foodItem._id) {
        try {
          const response = await axios.get(`${url}/api/inventory/product/${foodItem._id}`)
          if (response.data.success) {
            setInventory(response.data.data)
          }
        } catch (error) {
          console.error("Error fetching inventory:", error)
        } finally {
          setInventoryLoading(false)
        }
      }
    }

    fetchInventory()
  }, [foodItem, url])

  const getStockStatus = () => {
    if (inventoryLoading) return { text: "Đang tải...", color: "text-gray-400", bgColor: "bg-gray-100" }
    if (!inventory) return { text: "Không có thông tin", color: "text-gray-400", bgColor: "bg-gray-100" }

    if (inventory.quantity === 0) {
      return { text: "Hết hàng", color: "text-red-600", bgColor: "bg-red-50" }
    } else if (inventory.quantity <= 20) {
      return { text: `Chỉ còn ${inventory.quantity} sản phẩm`, color: "text-yellow-600", bgColor: "bg-yellow-50" }
    } else {
      return { text: `Còn ${inventory.quantity} sản phẩm`, color: "text-green-600", bgColor: "bg-green-50" }
    }
  }

  const stockStatus = getStockStatus()
  const isOutOfStock = inventory && inventory.quantity <= 0
  const maxQuantity = inventory ? Math.min(inventory.quantity, 10) : 10

  const handleAddToCart = () => {
    if (inventory && inventory.quantity <= 0) {
      toast.error("Sản phẩm đã hết hàng")
      return
    }

    if (inventory && cartItems[foodItem.name] + quantity > inventory.quantity) {
      toast.error(`Chỉ còn ${inventory.quantity} sản phẩm trong kho`)
      return
    }

    // Gọi function handleAddToCart từ useProductDetail hook
    handleAddToCartFromHook()
  }

  const handleBuyNow = () => {
    if (inventory && inventory.quantity <= 0) {
      toast.error("Sản phẩm đã hết hàng")
      return
    }

    if (inventory && quantity > inventory.quantity) {
      toast.error(`Chỉ còn ${inventory.quantity} sản phẩm trong kho`)
      return
    }

    // Gọi function handleBuyNow từ useProductDetail hook
    handleBuyNowFromHook()
  }

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

  // Check if current product is a drink
  const isDrink = foodItem && foodItem.category && foodItem.category.toLowerCase().includes("uống")


  if (!foodItem) {
    return <ProductNotFound />
  }

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
              images={
                foodItem
                  ? [
                      url + "/images/" + foodItem.image,
                      "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80",
                      "https://images.unsplash.com/photo-1565958011703-44f9829ba187?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80",
                    ]
                  : []
              }
              productName={foodItem ? foodItem.name : ""}
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
              stock={stock}
              inventory={inventory}
              stockStatus={stockStatus}
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
            editingRatingId={editingRatingId}
            handleEditRating={handleEditRating}
            handleSaveEdit={handleSaveEdit}
            handleCancelEdit={handleCancelEdit}
            url={url}
          />
        </div>

        {/* Conditional Suggestions Section */}
        {foodItem && (
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl overflow-hidden shadow-2xl mb-12 border border-slate-700 p-6">
            {isDrink ? (
              <SuggestedFoods drinkName={foodItem.name}  />
            ) : (
              <SuggestedDrinks productCategory={foodItem.category} category={foodItem.category} isCompact={false} />
            )}
          </div>
        )}

        <RelatedProducts
          relatedProducts={relatedProducts}
          url={url}
          relatedRatings={relatedRatings}
          navigate={navigate}
          addToCart={handleAddToCart}
        />

        {isOutOfStock && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="text-red-500 mr-2" size={20} />
              <span className="text-red-700 font-medium">Sản phẩm hiện tại đã hết hàng. Vui lòng quay lại sau.</span>
            </div>
          </div>
        )}
      </div>
      <ToastContainer />
    </div>
  )
}

export default ProductDetail
