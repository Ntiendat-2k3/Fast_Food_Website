const RevenueChart = ({ activeTab, categoryRevenue, productRevenue }) => {
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

  // Get percentage of total revenue
  const getPercentage = (revenue, totalRevenue) => {
    return ((revenue / totalRevenue) * 100).toFixed(0)
  }

  // Calculate total revenue
  const totalRevenue = Object.values(activeTab === "category" ? categoryRevenue : productRevenue).reduce(
    (sum, revenue) => sum + revenue,
    0,
  )

  return (
    <div className="bg-white dark:bg-dark rounded-xl p-4 md:p-6 shadow-md border border-gray-100 dark:border-dark-lighter">
      <h2 className="text-base md:text-lg font-semibold text-gray-800 dark:text-white mb-4">
        Biểu đồ doanh thu {activeTab === "category" ? "theo danh mục" : "theo sản phẩm"}
      </h2>
      <div className="flex flex-wrap gap-2 mb-4 max-h-24 overflow-y-auto scrollbar-thin">
        {Object.entries(activeTab === "category" ? categoryRevenue : productRevenue).map(([name, revenue], index) => (
          <div key={name} className="flex items-center">
            <div className={`w-3 h-3 rounded-full ${getColor(index)} mr-1`}></div>
            <span className="text-xs text-gray-600 dark:text-gray-300">{name}</span>
          </div>
        ))}
      </div>
      <div className="relative h-48 md:h-64">
        <div className="absolute inset-0 flex items-end overflow-x-auto pb-1 scrollbar-thin">
          {Object.entries(activeTab === "category" ? categoryRevenue : productRevenue).map(([name, revenue], index) => {
            const percentage = getPercentage(revenue, totalRevenue)
            return (
              <div
                key={name}
                className={`${getColor(index)} rounded-t-lg mx-0.5 sm:mx-1 min-w-[20px]`}
                style={{
                  height: `${percentage}%`,
                  width: `${
                    100 / Math.min(Object.keys(activeTab === "category" ? categoryRevenue : productRevenue).length, 10)
                  }%`,
                }}
                title={`${name}: ${percentage}%`}
              ></div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default RevenueChart
