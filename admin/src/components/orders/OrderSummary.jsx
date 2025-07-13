const OrderSummary = ({ totalAmount, discount, shippingFee, formatCurrency, voucherCode }) => {
  // Assuming totalAmount is the final amount paid by the customer
  // And discount is a positive value representing the amount discounted
  const itemsTotal = totalAmount - shippingFee + discount

  return (
    <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2 text-gray-700 dark:text-gray-200">
      <div className="flex justify-between text-sm">
        <span>Tổng tiền món ăn:</span>
        <span>{formatCurrency(itemsTotal)}</span>
      </div>
      {voucherCode && discount > 0 && (
        <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
          <span>Mã giảm giá ({voucherCode}):</span>
          <span>-{formatCurrency(discount)}</span>
        </div>
      )}
      <div className="flex justify-between text-sm">
        <span>Phí vận chuyển:</span>
        <span>{formatCurrency(shippingFee)}</span>
      </div>
      <div className="flex justify-between font-bold text-lg">
        <span>Tổng cộng:</span>
        <span>{formatCurrency(totalAmount)}</span>
      </div>
    </div>
  )
}

export default OrderSummary
