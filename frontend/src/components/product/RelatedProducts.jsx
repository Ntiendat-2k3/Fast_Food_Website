"use client"

import { motion } from "framer-motion"
import RelatedProductCard from "./RelatedProductCard"

const RelatedProducts = ({ relatedProducts, url, relatedRatings, navigate, addToCart }) => {
  if (relatedProducts.length === 0) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.9 }}
      className="mb-12"
    >
      <h2 className="text-3xl font-bold text-white mb-8">Sản phẩm liên quan</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {relatedProducts.map((item, index) => (
          <RelatedProductCard
            key={item._id}
            item={item}
            index={index}
            url={url}
            relatedRatings={relatedRatings}
            navigate={navigate}
            addToCart={addToCart}
          />
        ))}
      </div>
    </motion.div>
  )
}

export default RelatedProducts
