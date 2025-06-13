import PaymentMethodIcon from "./PaymentMethodIcon"

const OrderInfo = ({ order }) => {
  return (
    <div className="border-t md:border-t-0 md:border-l border-slate-600 pt-4 md:pt-0 md:pl-4">
      <h3 className="text-xs uppercase text-gray-400 mb-3 font-medium">Thông tin</h3>
      <div className="space-y-2 text-sm">
        <p className="flex justify-between">
          <span className="text-gray-400">Người nhận:</span>
          <span className="text-white font-medium">{order.address.name}</span>
        </p>
        <p className="flex justify-between">
          <span className="text-gray-400">SĐT:</span>
          <span className="text-white">{order.address.phone}</span>
        </p>
        <p className="flex flex-col">
          <span className="text-gray-400">Địa chỉ:</span>
          <span className="text-white text-right text-xs mt-1 break-words">{order.address.street}</span>
        </p>
        <div className="flex items-center justify-between pt-2 border-t border-slate-600">
          <PaymentMethodIcon method={order.paymentMethod} />
          <span className="text-lg font-bold text-primary">{order.amount.toLocaleString("vi-VN")} đ</span>
        </div>
      </div>
    </div>
  )
}

export default OrderInfo
