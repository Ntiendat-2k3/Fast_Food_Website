"use client"

import { useContext } from "react"
import { StoreContext } from "../../context/StoreContext"
import useWishlist from "../../hooks/useWishlist"
import AnimatedBackground from "../../components/common/AnimatedBackground"
import WishlistHeader from "../../components/wishlist/WishlistHeader"
import WishlistEmpty from "../../components/wishlist/WishlistEmpty"
import WishlistGrid from "../../components/wishlist/WishlistGrid"
// import WishlistActions from "../../components/wishlist/WishlistActions"
import WishlistLoading from "../../components/wishlist/WishlistLoading"

const Wishlist = () => {
  const { token } = useContext(StoreContext)
  const { wishlistItems, loading, ratings, removeFromWishlist, addAllToCart, isAddingAll } = useWishlist()

  if (!token) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 pt-20 pb-16">
      {/* Animated Background */}
      <AnimatedBackground />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <WishlistHeader itemCount={wishlistItems.length} />

        {/* Content */}
        {loading ? (
          <WishlistLoading />
        ) : wishlistItems.length === 0 ? (
          <WishlistEmpty />
        ) : (
          <>
            <WishlistGrid items={wishlistItems} onRemove={removeFromWishlist} ratings={ratings} />

            {/* Quick Actions */}
            {/* <WishlistActions
              onAddAllToCart={addAllToCart}
              isAddingAll={isAddingAll}
              itemCount={wishlistItems.length}
            /> */}
          </>
        )}
      </div>
    </div>
  )
}

export default Wishlist
