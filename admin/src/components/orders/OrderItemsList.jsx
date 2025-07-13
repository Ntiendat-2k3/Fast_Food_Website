const OrderItemsList = ({ items, formatCurrency }) => {
  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <div key={index} className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-300">
          <span className="font-medium">
            {item.name} x {item.quantity}
          </span>
          <span>{formatCurrency(item.price * item.quantity)}</span>
        </div>
      ))}
    </div>
  )
}

export default OrderItemsList
