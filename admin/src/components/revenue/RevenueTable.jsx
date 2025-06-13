const RevenueTable = ({ activeTab, categoryRevenue, productRevenue, totalRevenue, orders }) => {
  // Get color for chart
  const getColor = (index) => {
    const colors = [
      "bg-blue-500",
      "bg-green-500",
      "bg-yellow-500",
      "bg-red-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-teal-500",
    ]
    return colors[index % colors.length]
  }

  // Calculate percentage of each category or product
  const getPercentage = (amount) => ((amount / totalRevenue) * 100).toFixed(2)
  const getPercentage_ship = () => (((orders.length * 14000) / totalRevenue) * 100).toFixed(2)

  return (
    <div className="bg-white dark:bg-dark rounded-xl p-4 md:p-6 shadow-md border border-gray-100 dark:border-dark-lighter">
      <h2 className="text-base md:text-lg font-semibold text-gray-800 dark:text-white mb-4">
        Doanh thu {activeTab === "category" ? "theo danh mục" : "theo sản phẩm"}
      </h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-lighter">
          <thead>
            <tr>
              <th className="px-2 md:px-4 py-2 md:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {activeTab === "category" ? "Danh mục" : "Sản phẩm"}
              </th>
              <th className="px-2 md:px-4 py-2 md:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Doanh thu
              </th>
              <th className="px-2 md:px-4 py-2 md:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Phần trăm
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-dark-lighter">
            {Object.entries(activeTab === "category" ? categoryRevenue : productRevenue).map(
              ([name, revenue], index) => (
                <tr key={name} className="hover:bg-gray-50 dark:hover:bg-dark-lighter">
                  <td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-800 dark:text-white">{name}</td>
                  <td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-800 dark:text-white">
                    {revenue.toLocaleString("vi-VN")} đ
                  </td>
                  <td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm">
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 dark:bg-dark-lighter rounded-full h-1.5 md:h-2 mr-2 max-w-[80px] md:max-w-[100px]">
                        <div
                          className={`${getColor(index)} h-1.5 md:h-2 rounded-full`}
                          style={{ width: `${getPercentage(revenue)}%` }}
                        ></div>
                      </div>
                      <span className="text-gray-800 dark:text-white whitespace-nowrap text-xs">
                        {getPercentage(revenue)}%
                      </span>
                    </div>
                  </td>
                </tr>
              ),
            )}
            <tr className="hover:bg-gray-50 dark:hover:bg-dark-lighter">
              <td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-800 dark:text-white">Phí ship</td>
              <td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-800 dark:text-white">
                {(orders.length * 14000).toLocaleString("vi-VN")} đ
              </td>
              <td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm">
                <div className="flex items-center">
                  <div className="w-full bg-gray-200 dark:bg-dark-lighter rounded-full h-1.5 md:h-2 mr-2 max-w-[80px] md:max-w-[100px]">
                    <div
                      className="bg-blue-500 h-1.5 md:h-2 rounded-full"
                      style={{ width: `${getPercentage_ship()}%` }}
                    ></div>
                  </div>
                  <span className="text-gray-800 dark:text-white whitespace-nowrap text-xs">
                    {getPercentage_ship()}%
                  </span>
                </div>
              </td>
            </tr>
            <tr className="bg-gray-50 dark:bg-dark-lighter font-medium">
              <td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-800 dark:text-white">
                Tổng doanh thu
              </td>
              <td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm text-primary font-bold">
                {totalRevenue.toLocaleString("vi-VN")} đ
              </td>
              <td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-800 dark:text-white">100%</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default RevenueTable
