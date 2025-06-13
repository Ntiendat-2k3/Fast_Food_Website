import OrderCard from "./OrderCard"

const OrdersList = ({ orders, url, formatDate }) => {
  return (
    <div className="space-y-4">
      {orders.map((order, index) => (
        <OrderCard key={order._id || index} order={order} index={index} url={url} formatDate={formatDate} />
      ))}
    </div>
  )
}

export default OrdersList
