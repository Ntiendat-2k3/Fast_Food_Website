import OrderCard from "./OrderCard"

const OrdersList = ({ orders, url, formatDate, onOrderUpdate, confirmDelivery }) => {
  if (!orders || orders.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-400">Không tìm thấy đơn hàng nào</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {orders.map((order) => (
        <OrderCard
          key={order._id}
          order={order}
          url={url}
          formatDate={formatDate}
          onOrderUpdate={onOrderUpdate}
          confirmDelivery={confirmDelivery}
        />
      ))}
    </div>
  )
}

export default OrdersList
