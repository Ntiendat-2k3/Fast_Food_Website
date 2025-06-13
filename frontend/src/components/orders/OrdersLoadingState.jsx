const OrdersLoadingState = () => {
  return (
    <div className="text-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
      <p className="mt-4 text-gray-400">Đang tải đơn hàng...</p>
    </div>
  )
}

export default OrdersLoadingState
