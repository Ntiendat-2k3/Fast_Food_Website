"use client"

const OrderItem = ({ item, quantity, url }) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <img
          src={url + "/images/" + item.image || "/placeholder.svg"}
          alt={item.name}
          className="w-12 h-12 object-cover rounded-lg mr-3 border border-slate-600"
        />
        <div>
          <p className="text-white">{item.name}</p>
          <p className="text-gray-400 text-sm">
            {item.price.toLocaleString("vi-VN")}đ x {quantity}
          </p>
        </div>
      </div>
      <p className="text-yellow-400 font-medium">{(item.price * quantity).toLocaleString("vi-VN")}đ</p>
    </div>
  )
}

export default OrderItem
