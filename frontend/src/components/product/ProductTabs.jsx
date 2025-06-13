"use client"

import { motion, AnimatePresence } from "framer-motion"
import DescriptionTab from "./DescriptionTab"
import SpecificationsTab from "./SpecificationsTab"
import ReviewsTab from "./ReviewsTab"

const ProductTabs = ({
  activeTab,
  setActiveTab,
  foodItem,
  productDetails,
  ratingStats,
  showReviewForm,
  handleReviewSubmitted,
  setShowReviewForm,
  isCheckingEligibility,
  reviewEligibility,
  handleWriteReview,
  isLoadingReviews,
  reviews,
  token,
  user,
  editingCommentId,
  handleEditComment,
  handleSaveEdit,
  handleCancelEdit,
  url,
}) => {
  const tabs = [
    { id: "description", label: "Mô tả chi tiết" },
    { id: "specifications", label: "Thông tin sản phẩm" },
    { id: "reviews", label: `Đánh giá (${ratingStats.totalReviews})` },
  ]

  return (
    <div className="border-t border-slate-700">
      <div className="flex overflow-x-auto scrollbar-hide bg-slate-800/30">
        {tabs.map((tab) => (
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
          {activeTab === "description" && <DescriptionTab product={foodItem} />}

          {activeTab === "specifications" && <SpecificationsTab productDetails={productDetails} />}

          {activeTab === "reviews" && (
            <ReviewsTab
              showReviewForm={showReviewForm}
              foodItem={foodItem}
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
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

export default ProductTabs
