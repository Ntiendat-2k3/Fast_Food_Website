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
      .slice(0, 10) // Top 10 items

    return sortedData
  }

  const tableData = getData()
  const netRevenue = totalRevenue - totalVoucherDiscount - totalShippingFee

  // Get rank icon
  const getRankIcon = (index) => {
    switch (index) {
      case 0:
        return <Crown className="w-4 h-4 text-yellow-500" />
      case 1:
        return <Award className="w-4 h-4 text-gray-400" />
      case 2:
        return <Star className="w-4 h-4 text-orange-500" />
      default:
        return <span className="text-sm font-bold text-gray-500">{index + 1}</span>
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
      <div className="bg-white dark:bg-dark-light rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center">
          <TrendingUp className="mr-3 text-primary" size={24} />
          Bảng xếp hạng {activeTab === "category" ? "danh mục" : "sản phẩm"}
        </h3>
        <div className="flex items-center justify-center h-80">
          <div className="text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="w-12 h-12 text-gray-400" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">Không có dữ liệu để hiển thị</p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
              Dữ liệu sẽ xuất hiện khi có đơn hàng hoàn thành
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-dark-light rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
      <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-8 flex items-center">
        <TrendingUp className="mr-3 text-primary" size={24} />
        Top {activeTab === "category" ? "danh mục" : "sản phẩm"} bán chạy
      </h3>

      {/* Ranking Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 mb-8">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
              <tr>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-300">Hạng</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-300">
                  {activeTab === "category" ? "Danh mục" : "Sản phẩm"}
                </th>
                <th className="text-right py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-300">
                  Doanh thu
                </th>
                <th className="text-right py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-300">Tỷ lệ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {tableData.map((item, index) => (
                <tr
                  key={index}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200 group"
                >
                  <td className="py-4 px-6">
                    <div
                      className={`w-10 h-10 ${getRankBg(index)} rounded-xl flex items-center justify-center shadow-lg`}
                    >
                      {getRankIcon(index)}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center">
                      <div>
                        <p className="font-semibold text-gray-800 dark:text-white group-hover:text-primary transition-colors">
                          {item.name.length > 30 ? `${item.name.substring(0, 30)}...` : item.name}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {activeTab === "category" ? "Danh mục" : "Sản phẩm"}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="font-bold text-lg text-gray-800 dark:text-white">
                      {item.revenue.toLocaleString("vi-VN")} đ
                    </div>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end space-x-3">
                      <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-primary to-primary-dark h-2 rounded-full transition-all duration-1000"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-gray-600 dark:text-gray-400 w-12">
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
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-6">
        <h4 className="text-lg font-bold text-gray-800 dark:text-white mb-6 flex items-center">
          <Calculator className="mr-3 text-primary" size={20} />
          Tổng Kết Tài Chính
        </h4>

        <div className="space-y-4">
          {/* Product Revenue */}
          <div className="flex justify-between items-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center mr-3">
                <Package size={18} className="text-white" />
              </div>
              <span className="font-semibold text-blue-700 dark:text-blue-300">Doanh thu sản phẩm</span>
            </div>
            <span className="text-lg font-bold text-blue-700 dark:text-blue-300">
              {totalRevenue.toLocaleString("vi-VN")} đ
            </span>
          </div>

          {/* Voucher Discount */}
          {totalVoucherDiscount > 0 && (
            <div className="flex justify-between items-center p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center mr-3">
                  <span className="text-white font-bold">%</span>
                </div>
                <span className="font-semibold text-red-700 dark:text-red-300">Giảm giá voucher</span>
              </div>
              <span className="text-lg font-bold text-red-700 dark:text-red-300">
                -{totalVoucherDiscount.toLocaleString("vi-VN")} đ
              </span>
            </div>
          )}

          {/* Shipping Fee */}
          <div className="flex justify-between items-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-200 dark:border-orange-800">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center mr-3">
                <Package size={18} className="text-white" />
              </div>
              <span className="font-semibold text-orange-700 dark:text-orange-300">Chi phí vận chuyển</span>
            </div>
            <span className="text-lg font-bold text-orange-700 dark:text-orange-300">
              -{totalShippingFee.toLocaleString("vi-VN")} đ
            </span>
          </div>

          {/* Divider */}
          <div className="border-t-2 border-dashed border-gray-300 dark:border-gray-600 my-4"></div>

          {/* Net Revenue */}
          <div className="flex justify-between items-center p-6 bg-gradient-to-r from-green-500 to-green-600 rounded-xl text-white shadow-lg">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mr-4">
                <TrendingUp size={20} className="text-white" />
              </div>
              <div>
                <span className="text-lg font-bold">Doanh thu thực</span>
                <p className="text-green-100 text-sm">Lợi nhuận sau các khoản trừ</p>
              </div>
            </div>
            <span className="text-2xl font-bold">{netRevenue.toLocaleString("vi-VN")} đ</span>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="mt-6 pt-6 border-t border-gray-300 dark:border-gray-600">
          <div className="grid grid-cols-2 gap-6">
            <div className="text-center p-4 bg-white dark:bg-dark rounded-xl shadow-sm">
              <div className="flex items-center justify-center mb-2">
                <Users className="mr-2 text-primary" size={18} />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Đơn hàng hoàn thành</span>
              </div>
              <div className="text-2xl font-bold text-gray-800 dark:text-white">{orders.length}</div>
            </div>
            <div className="text-center p-4 bg-white dark:bg-dark rounded-xl shadow-sm">
              <div className="flex items-center justify-center mb-2">
                <Calculator className="mr-2 text-primary" size={18} />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Doanh thu/đơn</span>
              </div>
              <div className="text-2xl font-bold text-gray-800 dark:text-white">
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
