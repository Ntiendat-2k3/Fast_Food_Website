import { DollarSign, ShoppingBag, Calendar } from "lucide-react"

const RevenueSummaryCards = ({ totalRevenue, orders }) => {
  // Calculate percentage for shipping fee
  const getPercentage_ship = () => (((orders.length * 14000) / totalRevenue) * 100).toFixed(2)

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 mb-6 md:mb-8">
      {/* Total Revenue Card */}
      <div className="bg-white dark:bg-dark rounded-xl p-4 md:p-6 shadow-md border border-gray-100 dark:border-dark-lighter">
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/20 rounded-full flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0">
            <DollarSign size={22} className="text-primary" />
          </div>
          <div>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Tổng doanh thu</p>
            <p className="text-lg md:text-2xl font-bold text-gray-800 dark:text-white">
              {totalRevenue.toLocaleString("vi-VN")} đ
            </p>
          </div>
        </div>
        <div className="w-full bg-gray-200 dark:bg-dark-lighter rounded-full h-2">
          <div className="bg-primary h-2 rounded-full w-full"></div>
        </div>
      </div>

      {/* Total Orders Card */}
      <div className="bg-white dark:bg-dark rounded-xl p-4 md:p-6 shadow-md border border-gray-100 dark:border-dark-lighter">
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0">
            <ShoppingBag size={22} className="text-green-500" />
          </div>
          <div>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Tổng đơn hàng</p>
            <p className="text-lg md:text-2xl font-bold text-gray-800 dark:text-white">{orders.length}</p>
          </div>
        </div>
        <div className="w-full bg-gray-200 dark:bg-dark-lighter rounded-full h-2">
          <div className="bg-green-500 h-2 rounded-full" style={{ width: `${(orders.length / 100) * 100}%` }}></div>
        </div>
      </div>

      {/* Shipping Fee Card */}
      <div className="bg-white dark:bg-dark rounded-xl p-4 md:p-6 shadow-md border border-gray-100 dark:border-dark-lighter sm:col-span-2 lg:col-span-1">
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0">
            <Calendar size={22} className="text-blue-500" />
          </div>
          <div>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Phí vận chuyển</p>
            <p className="text-lg md:text-2xl font-bold text-gray-800 dark:text-white">
              {(orders.length * 14000).toLocaleString("vi-VN")} đ
            </p>
          </div>
        </div>
        <div className="w-full bg-gray-200 dark:bg-dark-lighter rounded-full h-2">
          <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${getPercentage_ship()}%` }}></div>
        </div>
      </div>
    </div>
  )
}

export default RevenueSummaryCards
