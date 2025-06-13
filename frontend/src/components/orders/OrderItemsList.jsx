import { Star } from "lucide-react"

const OrderItemsList = ({ items, url }) => {
  return (
    <div className="md:col-span-2">
      <h3 className="text-xs uppercase text-gray-400 mb-3 font-medium flex items-center">
        <Star className="mr-1" size={12} />
        Sản phẩm
      </h3>
      <div className="space-y-3 max-h-32 overflow-y-auto pr-2 scrollbar-hide">
        {items.map((item, idx) => (
          <div key={idx} className="flex justify-between text-sm">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-slate-600/50 rounded-lg overflow-hidden mr-3 flex-shrink-0">
                <img
                  src={url + "/images/" + item.image || "/placeholder.svg"}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-white truncate max-w-[120px] sm:max-w-[150px]">
                {item.name} <span className="text-gray-400">x{item.quantity}</span>
              </span>
            </div>
            <span className="text-primary font-medium whitespace-nowrap">
              {(item.price * item.quantity).toLocaleString("vi-VN")} đ
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default OrderItemsList
