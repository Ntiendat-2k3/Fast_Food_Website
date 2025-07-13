import OrderHeader from "./OrderHeader"
import OrderItemsList from "./OrderItemsList"
import OrderSummary from "./OrderSummary"
import PaymentMethodIcon from "./PaymentMethodIcon"

const OrderCard = ({ order, url, onStatusChange, formatDate, formatCurrency, SHIPPING_FEE }) => {
  return (
    <div className="bg-gray-50 dark:bg-dark-card p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <OrderHeader order={order} onStatusChange={onStatusChange} formatDate={formatDate} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        <div className="md:col-span-2">
          <h3 className="text-md font-semibold text-gray-700 dark:text-gray-200 mb-2">Chi tiết đơn hàng:</h3>
          <OrderItemsList items={order.items} formatCurrency={formatCurrency} />
        </div>
        <div className="md:col-span-1">
          <h3 className="text-md font-semibold text-gray-700 dark:text-gray-200 mb-2">Thông tin giao hàng:</h3>
          <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
            <p>
              <strong>Tên:</strong> {order.address.name}
            </p>
            <p>
              <strong>Số điện thoại:</strong> {order.address.phone}
            </p>
            <p>
              <strong>Địa chỉ:</strong> {order.address.street}, {order.address.ward}, {order.address.district},{" "}
              {order.address.province}
            </p>
            <p>
              <strong>Mã bưu điện:</strong> {order.address.zipcode}
            </p>
          </div>

          <h3 className="text-md font-semibold text-gray-700 dark:text-gray-200 mt-4 mb-2">Phương thức thanh toán:</h3>
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
            <PaymentMethodIcon method={order.paymentMethod} />
            <span className="ml-2">
              {order.paymentMethod === "COD" ? "Thanh toán khi nhận hàng" : order.paymentMethod}
            </span>
          </div>
        </div>
      </div>

      <OrderSummary
        totalAmount={order.amount}
        discount={order.discountAmount || 0}
        shippingFee={SHIPPING_FEE}
        formatCurrency={formatCurrency}
        voucherCode={order.voucherCode}
      />
    </div>
  )
}

export default OrderCard
