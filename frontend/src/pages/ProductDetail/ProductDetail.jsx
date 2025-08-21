"use client"

//////////////////////////////
// IMPORT
//////////////////////////////
import { useContext, useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import axios from "axios"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

import { StoreContext } from "../../context/StoreContext"
import { useProductDetail } from "../../hooks/useProductDetail"
import { useReviews } from "../../hooks/useReviews"

import Breadcrumb from "../../components/product/Breadcrumb"
import ProductNotFound from "../../components/product/ProductNotFound"
import ProductImageGallery from "../../components/product/ProductImageGallery"
import ProductInfo from "../../components/product/ProductInfo"
import ProductTabs from "../../components/product/ProductTabs"
import RelatedProducts from "../../components/product/RelatedProducts"
import SuggestedSalads from "../../components/product/SuggestedSalads"
import { AlertCircle } from "lucide-react"

//////////////////////////////
// COMPONENT
//////////////////////////////
const ProductDetail = () => {
  // ======= Hooks & Context =======
  const { slug } = useParams()
  const navigate = useNavigate()
  const { url, user, token, cartItems, addToCart } = useContext(StoreContext)

  // ======= Product Detail Hook =======
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
    increaseQuantity,
    decreaseQuantity,
    toggleWishlist,
    handleBuyNow: hookHandleBuyNow, // Get handleBuyNow from hook
  } = useProductDetail(slug)
  console.log(foodItem)

  // ======= Review Hook =======
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

  // ======= Inventory State =======
  const [inventory, setInventory] = useState(null)
  const [inventoryLoading, setInventoryLoading] = useState(true)
  const [isAddingToCart, setIsAddingToCart] = useState(false)

  // ======= Fetch Inventory =======
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

  // ======= Stock Logic =======
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

  // ======= Handle Add to Cart =======
  const handleAddToCart = async () => {
    if (!token) {
      toast.error("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng")
      return
    }

    if (isOutOfStock) {
      toast.error("Sản phẩm đã hết hàng")
      return
    }

    if (!foodItem || !foodItem._id) {
      toast.error("Không tìm thấy thông tin sản phẩm")
      return
    }

    // Check if adding this quantity would exceed inventory
    const currentCartQuantity = cartItems[foodItem._id] || 0
    if (currentCartQuantity + quantity > inventory.quantity) {
      toast.error(`Chỉ còn ${inventory.quantity} sản phẩm trong kho`)
      return
    }

    setIsAddingToCart(true)

    try {
      console.log("Adding to cart - Product ID:", foodItem._id, "Quantity:", quantity)
      await addToCart(foodItem._id, quantity)
      toast.success(`Đã thêm ${quantity} sản phẩm vào giỏ hàng`)
    } catch (error) {
      console.error("Error adding to cart:", error)
      toast.error("Lỗi khi thêm vào giỏ hàng")
    } finally {
      setIsAddingToCart(false)
    }
  }

  // ======= Handle Buy Now =======
  const handleBuyNow = async () => {
    if (!token) {
      toast.error("Vui lòng đăng nhập để mua hàng")
      return
    }

    if (isOutOfStock) {
      toast.error("Sản phẩm đã hết hàng")
      return
    }

    if (!foodItem || !foodItem._id) {
      toast.error("Không tìm thấy thông tin sản phẩm")
      return
    }

    if (quantity > inventory.quantity) {
      toast.error(`Chỉ còn ${inventory.quantity} sản phẩm trong kho`)
      return
    }

    // Use the hook's handleBuyNow function which navigates directly to checkout
    hookHandleBuyNow()
  }

  // ======= Product Info (Hardcoded) =======
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

  // ======= Breadcrumb =======
  const breadcrumbItems = [
    { label: "Trang chủ", link: "/" },
    { label: "Thực đơn", link: "/foods" },
    { label: foodItem ? foodItem.name : "Sản phẩm không tồn tại" },
  ]

  // ======= Trường hợp sản phẩm không tồn tại =======
  if (!foodItem) return <ProductNotFound />

  //////////////////////////////
  // RETURN GIAO DIỆN
  //////////////////////////////
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-20 pb-16">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <Breadcrumb items={breadcrumbItems} />

        {/* Product Detail Section */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl overflow-hidden shadow-2xl mb-12 border border-slate-700">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 lg:p-8">
            {/* Left - Product Images */}
            <div className="lg:col-span-1 order-1 lg:order-2">
              <ProductImageGallery
                images={
                  foodItem
                    ? [
                        `${url}/images/${foodItem.image}`,
                        "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=1000&q=80",
                        "https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=1000&q=80",
                      ]
                    : []
                }
                productName={foodItem.name}
                isInWishlist={isInWishlist}
                toggleWishlist={toggleWishlist}
                ratingStats={ratingStats}
              />

              <SuggestedSalads currentProduct={foodItem} isCompact={true} />
            </div>

            {/* Right - Product Info */}
            <div className="lg:col-span-1 order-2 lg:order-3">
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
                url={url}
                isAddingToCart={isAddingToCart}
                maxQuantity={maxQuantity}
                isOutOfStock={isOutOfStock}
              />
            </div>
          </div>

          {/* Tabs: Mô tả, Đánh giá,... */}
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

        {/* Sản phẩm liên quan */}
        <RelatedProducts
          relatedProducts={relatedProducts}
          url={url}
          relatedRatings={relatedRatings}
          navigate={navigate}
          addToCart={addToCart}
        />

        {/* Thông báo hết hàng */}
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
