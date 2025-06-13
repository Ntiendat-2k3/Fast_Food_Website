"use client"

const CartLoadingState = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mb-4"></div>
      <p className="text-gray-300">Đang tải giỏ hàng...</p>
    </div>
  )
}

export default CartLoadingState
