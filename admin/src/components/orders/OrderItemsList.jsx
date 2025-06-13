const OrderItemsList = ({ items, url, formatCurrency }) => {
  return (
    <div className="md:col-span-2">
      <h3 className="text-xs uppercase text-gray-500 dark:text-gray-400 mb-2 font-medium">Sản phẩm</h3>
      <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto pr-2 scrollbar-thin">
        {items.map((item, idx) => (
          <div key={idx} className="flex justify-between text-sm">
            <div className="flex items-center min-w-0">
              <div className="w-8 h-8 bg-gray-100 dark:bg-dark-lighter rounded overflow-hidden mr-2 flex-shrink-0">
                <img
                  src={url + "/images/" + item.image || "/placeholder.svg"}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-dark dark:text-white truncate">
                {item.name} <span className="text-gray-500 dark:text-gray-400">x{item.quantity}</span>
              </span>
            </div>
            <span className="text-gray-700 dark:text-gray-300 whitespace-nowrap ml-2">
              {formatCurrency(item.price * item.quantity)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default OrderItemsList
