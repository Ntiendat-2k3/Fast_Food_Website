import { Tag } from "lucide-react"
import PaymentMethodIcon from "./PaymentMethodIcon"

const OrderSummary = ({ order, SHIPPING_FEE, formatCurrency }) => {
  return (
    <div className="border-t md:border-t-0 md:border-l border-gray-200 dark:border-dark-lighter pt-3 md:pt-0 md:pl-4 mt-2 md:mt-0">
      <h3 className="text-xs uppercase text-gray-500 dark:text-gray-400 mb-2 font-medium">Thông tin</h3>
      <div className="space-y-1 text-sm">
        <p className="flex justify-between items-start">
          <span className="text-gray-500 dark:text-gray-400">Địa chỉ:</span>
          <span className="text-dark dark:text-white text-right text-xs max-w-[200px] break-words">
            {order.address.street}
          </span>
        </p>

        {/* Phí ship cố định */}
        <p className="flex justify-between items-center">
          <span className="text-gray-500 dark:text-gray-400">Phí ship:</span>
          <span className="text-dark dark:text-white">{formatCurrency(SHIPPING_FEE)}</span>
        </p>

        {/* Thông tin mã giảm giá - Hiển thị nổi bật hơn */}
        {order.voucherCode && (
          <div className="mt-2 p-2 bg-primary/5 dark:bg-primary/10 rounded-lg border border-primary/20">
            <div className="flex items-center mb-1">
              <Tag size={14} className="text-primary mr-1.5" />
              <span className="text-gray-700 dark:text-gray-300 font-medium">Mã giảm giá:</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-primary font-medium bg-primary/10 px-2 py-0.5 rounded">{order.voucherCode}</span>
              {order.discountAmount > 0 && (
                <span className="text-green-500 font-medium">-{formatCurrency(order.discountAmount)}</span>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-2 mt-1 border-t border-gray-200 dark:border-gray-700">
          <PaymentMethodIcon method={order.paymentMethod} />
          <div className="flex flex-col items-end">
            <span className="text-lg font-bold text-primary">{formatCurrency(order.amount)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderSummary
