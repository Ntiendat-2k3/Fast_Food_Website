import { TrendingUp, Package, Users, Calculator, Crown, Star, Award } from "lucide-react"

const RevenueTable = ({
  activeTab,
  categoryRevenue,
  productRevenue,
  totalRevenue,
  orders,
  totalVoucherDiscount,
  totalShippingFee,
}) => {
  // Get data based on active tab
  const getData = () => {
    const data = activeTab === "category" ? categoryRevenue : productRevenue

    if (!data || Object.keys(data).length === 0) {
      return []
    }

    // Convert to array and sort by revenue
    const sortedData = Object.entries(data)
      .map(([name, revenue]) => ({
        name,
        revenue,
        percentage: ((revenue / totalRevenue) * 100).toFixed(1),
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 6) // Top 6 items for compact view

    return sortedData
  }

  const tableData = getData()
  const netRevenue = totalRevenue - totalVoucherDiscount - totalShippingFee

  // Get rank icon
  const getRankIcon = (index) => {
    switch (index) {
      case 0:
        return <Crown className="w-3 h-3 text-yellow-500" />
      case 1:
        return <Award className="w-3 h-3 text-gray-400" />
      case 2:
        return <Star className="w-3 h-3 text-orange-500" />
      default:
        return <span className="text-xs font-bold text-gray-500">{index + 1}</span>
    }
  }

  // Get rank background color
  const getRankBg = (index) => {
    switch (index) {
      case 0:
        return "bg-gradient-to-r from-yellow-400 to-yellow-500"
      case 1:
        return "bg-gradient-to-r from-gray-300 to-gray-400"
      case 2:
        return "bg-gradient-to-r from-orange-400 to-orange-500"
      default:
        return "bg-gradient-to-r from-blue-400 to-blue-500"
    }
  }

  if (tableData.length === 0) {
    return (
      <div className="bg-white dark:bg-dark-light rounded-xl p-4 shadow-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-base font-bold text-gray-800 dark:text-white mb-4 flex items-center">
          <TrendingUp className="mr-2 text-primary" size={18} />
          Bảng xếp hạng {activeTab === "category" ? "danh mục" : "sản phẩm"}
        </h3>
        <div className="flex items-center justify-center h-48">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 font-medium">Không có dữ liệu để hiển thị</p>
            <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
              Dữ liệu sẽ xuất hiện khi có đơn hàng hoàn thành
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-dark-light rounded-xl p-4 shadow-lg border border-gray-200 dark:border-gray-700">
      <h3 className="text-base font-bold text-gray-800 dark:text-white mb-4 flex items-center">
        <TrendingUp className="mr-2 text-primary" size={18} />
        Top {activeTab === "category" ? "danh mục" : "sản phẩm"} bán chạy
      </h3>

      {/* Ranking Table */}
      <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 mb-4">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
              <tr>
                <th className="text-left py-2 px-3 text-xs font-semibold text-gray-600 dark:text-gray-300">Hạng</th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-gray-600 dark:text-gray-300">
                  {activeTab === "category" ? "Danh mục" : "Sản phẩm"}
                </th>
                <th className="text-right py-2 px-3 text-xs font-semibold text-gray-600 dark:text-gray-300">
                  Doanh thu
                </th>
                <th className="text-right py-2 px-3 text-xs font-semibold text-gray-600 dark:text-gray-300">Tỷ lệ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {tableData.map((item, index) => (
                <tr
                  key={index}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200 group"
                >
                  <td className="py-2 px-3">
                    <div
                      className={`w-7 h-7 ${getRankBg(index)} rounded-lg flex items-center justify-center shadow-sm`}
                    >
                      {getRankIcon(index)}
                    </div>
                  </td>
                  <td className="py-2 px-3">
                    <div className="flex items-center">
                      <div>
                        <p className="font-semibold text-gray-800 dark:text-white group-hover:text-primary transition-colors text-sm">
                          {item.name.length > 20 ? `${item.name.substring(0, 20)}...` : item.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {activeTab === "category" ? "Danh mục" : "Sản phẩm"}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-2 px-3 text-right">
                    <div className="font-bold text-sm text-gray-800 dark:text-white">
                      {item.revenue.toLocaleString("vi-VN")} đ
                    </div>
                  </td>
                  <td className="py-2 px-3 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <div className="w-12 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                        <div
                          className="bg-gradient-to-r from-primary to-primary-dark h-1.5 rounded-full transition-all duration-1000"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 w-8">
                        {item.percentage}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-lg p-3">
        <h4 className="text-sm font-bold text-gray-800 dark:text-white mb-3 flex items-center">
          <Calculator className="mr-2 text-primary" size={16} />
          Tổng Kết Tài Chính
        </h4>

        <div className="space-y-2">
          {/* Product Revenue */}
          <div className="flex justify-between items-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center">
              <div className="w-6 h-6 bg-blue-500 rounded-lg flex items-center justify-center mr-2">
                <Package size={12} className="text-white" />
              </div>
              <span className="font-semibold text-blue-700 dark:text-blue-300 text-xs">Doanh thu sản phẩm</span>
            </div>
            <span className="text-sm font-bold text-blue-700 dark:text-blue-300">
              {totalRevenue.toLocaleString("vi-VN")} đ
            </span>
          </div>

          {/* Voucher Discount */}
          {totalVoucherDiscount > 0 && (
            <div className="flex justify-between items-center p-2 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <div className="flex items-center">
                <div className="w-6 h-6 bg-red-500 rounded-lg flex items-center justify-center mr-2">
                  <span className="text-white font-bold text-xs">%</span>
                </div>
                <span className="font-semibold text-red-700 dark:text-red-300 text-xs">Giảm giá voucher</span>
              </div>
              <span className="text-sm font-bold text-red-700 dark:text-red-300">
                -{totalVoucherDiscount.toLocaleString("vi-VN")} đ
              </span>
            </div>
          )}

          {/* Shipping Fee */}
          <div className="flex justify-between items-center p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
            <div className="flex items-center">
              <div className="w-6 h-6 bg-orange-500 rounded-lg flex items-center justify-center mr-2">
                <Package size={12} className="text-white" />
              </div>
              <span className="font-semibold text-orange-700 dark:text-orange-300 text-xs">Chi phí vận chuyển</span>
            </div>
            <span className="text-sm font-bold text-orange-700 dark:text-orange-300">
              -{totalShippingFee.toLocaleString("vi-VN")} đ
            </span>
          </div>

          {/* Divider */}
          <div className="border-t border-dashed border-gray-300 dark:border-gray-600 my-2"></div>

          {/* Net Revenue */}
          <div className="flex justify-between items-center p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-lg text-white shadow-sm">
            <div className="flex items-center">
              <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center mr-2">
                <TrendingUp size={14} className="text-white" />
              </div>
              <div>
                <span className="text-sm font-bold">Doanh thu thực</span>
                <p className="text-green-100 text-xs">Lợi nhuận sau các khoản trừ</p>
              </div>
            </div>
            <span className="text-lg font-bold">{netRevenue.toLocaleString("vi-VN")} đ</span>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="mt-3 pt-3 border-t border-gray-300 dark:border-gray-600">
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-2 bg-white dark:bg-dark rounded-lg shadow-sm">
              <div className="flex items-center justify-center mb-1">
                <Users className="mr-1 text-primary" size={14} />
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Đơn hàng hoàn thành</span>
              </div>
              <div className="text-lg font-bold text-gray-800 dark:text-white">{orders.length}</div>
            </div>
            <div className="text-center p-2 bg-white dark:bg-dark rounded-lg shadow-sm">
              <div className="flex items-center justify-center mb-1">
                <Calculator className="mr-1 text-primary" size={14} />
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Doanh thu/đơn</span>
              </div>
              <div className="text-lg font-bold text-gray-800 dark:text-white">
                {orders.length > 0 ? Math.round(netRevenue / orders.length).toLocaleString("vi-VN") : 0} đ
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RevenueTable
