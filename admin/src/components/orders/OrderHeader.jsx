import OrderStatusStepper from "./OrderStatusStepper"

const OrderHeader = ({ order, onStatusChange, formatDate }) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
      <div>
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Đơn hàng #{order._id}</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Ngày đặt: {formatDate(order.date)}</p>
      </div>
      <div className="mt-3 sm:mt-0">
        <OrderStatusStepper currentStatus={order.status} orderId={order._id} onStatusChange={onStatusChange} />
      </div>
    </div>
  )
}

export default OrderHeader
