import { DollarSign, Truck, TrendingDown, TrendingUp } from "lucide-react"

const RevenueSummaryCards = ({ totalRevenue, orders, totalVoucherDiscount, totalShippingFee }) => {
  // Calculate net revenue (after subtracting voucher discount and shipping fee)
  const netRevenue = totalRevenue - totalVoucherDiscount - totalShippingFee

  // Calculate average order value
  const avgOrderValue = orders.length > 0 ? netRevenue / orders.length : 0

  return (
    <div className="space-y-4">
      {/* Breakdown Analysis */}
      <div className="bg-white dark:bg-dark rounded-xl p-4 shadow-lg border border-gray-100 dark:border-gray-700">
        <h3 className="text-base font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
          <TrendingUp className="mr-2 text-primary" size={18} />
          Phân Tích Chi Tiết
        </h3>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Product Revenue */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <TrendingUp size={16} className="text-white" />
              </div>
              <span className="text-xs bg-blue-500 text-white px-1.5 py-0.5 rounded-full">+100%</span>
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">Doanh thu sản phẩm</p>
            <p className="text-base font-bold text-blue-700 dark:text-blue-300">
              {totalRevenue.toLocaleString("vi-VN")} đ
            </p>
          </div>

          {/* Voucher Impact */}
          <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-lg p-3 border border-red-200 dark:border-red-800">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
                <TrendingDown size={16} className="text-white" />
              </div>
              <span className="text-xs bg-red-500 text-white px-1.5 py-0.5 rounded-full">
                -{((totalVoucherDiscount / totalRevenue) * 100).toFixed(1)}%
              </span>
            </div>
            <p className="text-xs text-red-600 dark:text-red-400 font-medium mb-1">Giảm giá voucher</p>
            <p className="text-base font-bold text-red-700 dark:text-red-300">
              -{totalVoucherDiscount.toLocaleString("vi-VN")} đ
            </p>
          </div>

          {/* Shipping Cost */}
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg p-3 border border-orange-200 dark:border-orange-800">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <Truck size={16} className="text-white" />
              </div>
              <span className="text-xs bg-orange-500 text-white px-1.5 py-0.5 rounded-full">
                -{((totalShippingFee / totalRevenue) * 100).toFixed(1)}%
              </span>
            </div>
            <p className="text-xs text-orange-600 dark:text-orange-400 font-medium mb-1">Chi phí vận chuyển</p>
            <p className="text-base font-bold text-orange-700 dark:text-orange-300">
              -{totalShippingFee.toLocaleString("vi-VN")} đ
            </p>
          </div>

          {/* Net Profit */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-3 border border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                <DollarSign size={16} className="text-white" />
              </div>
              <span className="text-xs bg-green-500 text-white px-1.5 py-0.5 rounded-full">
                {((netRevenue / totalRevenue) * 100).toFixed(1)}%
              </span>
            </div>
            <p className="text-xs text-green-600 dark:text-green-400 font-medium mb-1">Lợi nhuận thực</p>
            <p className="text-base font-bold text-green-700 dark:text-green-300">
              {netRevenue.toLocaleString("vi-VN")} đ
            </p>
          </div>
        </div>

        {/* Formula Visualization */}
        <div className="mt-4 p-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-center space-x-2 text-xs font-medium">
            <span className="px-2 py-1 bg-blue-500 text-white rounded">{totalRevenue.toLocaleString("vi-VN")}đ</span>
            <span className="text-gray-500">−</span>
            <span className="px-2 py-1 bg-red-500 text-white rounded">
              {totalVoucherDiscount.toLocaleString("vi-VN")}đ
            </span>
            <span className="text-gray-500">−</span>
            <span className="px-2 py-1 bg-orange-500 text-white rounded">
              {totalShippingFee.toLocaleString("vi-VN")}đ
            </span>
            <span className="text-gray-500">=</span>
            <span className="px-2 py-1 bg-green-500 text-white rounded font-bold">
              {netRevenue.toLocaleString("vi-VN")}đ
            </span>
          </div>
          <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-1">
            Sản phẩm − Voucher − Vận chuyển = Doanh thu thực
          </p>
        </div>
      </div>
    </div>
  )
}

export default RevenueSummaryCards
