"use client"

import { useEffect, useState } from "react"
import { toast } from "react-toastify"
import axios from "axios"
import { TrendingUp, DollarSign, ShoppingBag, PieChart, BarChart, Calendar } from "lucide-react"

const Revenue = ({ url }) => {
  const [orders, setOrders] = useState([])
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [categoryRevenue, setCategoryRevenue] = useState({})
  const [productRevenue, setProductRevenue] = useState({})
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("category")

  // Fetch all orders from API
  const fetchAllOrders = async () => {
    setLoading(true)
    try {
      const response = await axios.get(url + "/api/order/list")
      if (response.data.success) {
        const orders = response.data.data
        setOrders(orders)

        // Calculate total revenue from orders
        const total = orders.reduce((sum, order) => sum + order.amount, 0)
        setTotalRevenue(total)

        // Calculate revenue by category and product
        const categoryRev = {}
        const productRev = {}

        orders.forEach((order) => {
          order.items.forEach((item) => {
            // Revenue by category
            if (!categoryRev[item.category]) {
              categoryRev[item.category] = 0
            }
            categoryRev[item.category] += item.price * item.quantity

            // Revenue by product
            if (!productRev[item.name]) {
              productRev[item.name] = 0
            }
            productRev[item.name] += item.price * item.quantity
          })
        })

        setCategoryRevenue(categoryRev)
        setProductRevenue(productRev)
      } else {
        toast.error("Error fetching orders")
      }
    } catch (error) {
      toast.error("Error connecting to server")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAllOrders()
  }, [])

  // Calculate percentage of each category or product
  const getPercentage = (amount) => ((amount / totalRevenue) * 100).toFixed(2)
  const getPercentage_ship = () => (((orders.length * 14000) / totalRevenue) * 100).toFixed(2)

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

  return (
    <div className="w-full">
      <div className="bg-white dark:bg-dark-light md:rounded-2xl md:shadow-custom p-3 md:p-6 mb-4 md:mb-8">
        <h1 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white mb-4 md:mb-6 flex items-center">
          <TrendingUp className="mr-2" size={24} />
          Thống kê doanh thu
        </h1>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {/* Revenue Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 mb-6 md:mb-8">
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
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${(orders.length / 100) * 100}%` }}
                  ></div>
                </div>
              </div>

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

            {/* Revenue Tabs */}
            <div className="mb-4 md:mb-6 overflow-x-auto">
              <div className="flex border-b border-gray-200 dark:border-dark-lighter min-w-[300px]">
                <button
                  onClick={() => setActiveTab("category")}
                  className={`py-2.5 px-4 sm:px-6 font-medium text-sm whitespace-nowrap ${
                    activeTab === "category"
                      ? "border-b-2 border-primary text-primary"
                      : "text-gray-600 dark:text-gray-300"
                  }`}
                >
                  <PieChart size={16} className="inline mr-2" />
                  Theo danh mục
                </button>
                <button
                  onClick={() => setActiveTab("product")}
                  className={`py-2.5 px-4 sm:px-6 font-medium text-sm whitespace-nowrap ${
                    activeTab === "product"
                      ? "border-b-2 border-primary text-primary"
                      : "text-gray-600 dark:text-gray-300"
                  }`}
                >
                  <BarChart size={16} className="inline mr-2" />
                  Theo sản phẩm
                </button>
              </div>
            </div>

            {/* Revenue Charts and Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              {/* Chart */}
              <div className="bg-white dark:bg-dark rounded-xl p-4 md:p-6 shadow-md border border-gray-100 dark:border-dark-lighter">
                <h2 className="text-base md:text-lg font-semibold text-gray-800 dark:text-white mb-4">
                  Biểu đồ doanh thu {activeTab === "category" ? "theo danh mục" : "theo sản phẩm"}
                </h2>
                <div className="flex flex-wrap gap-2 mb-4 max-h-24 overflow-y-auto scrollbar-thin">
                  {Object.entries(activeTab === "category" ? categoryRevenue : productRevenue).map(
                    ([name, revenue], index) => (
                      <div key={name} className="flex items-center">
                        <div className={`w-3 h-3 rounded-full ${getColor(index)} mr-1`}></div>
                        <span className="text-xs text-gray-600 dark:text-gray-300">{name}</span>
                      </div>
                    ),
                  )}
                </div>
                <div className="relative h-48 md:h-64">
                  <div className="absolute inset-0 flex items-end overflow-x-auto pb-1 scrollbar-thin">
                    {Object.entries(activeTab === "category" ? categoryRevenue : productRevenue).map(
                      ([name, revenue], index) => {
                        const percentage = getPercentage(revenue)
                        return (
                          <div
                            key={name}
                            className={`${getColor(index)} rounded-t-lg mx-0.5 sm:mx-1 min-w-[20px]`}
                            style={{
                              height: `${percentage}%`,
                              width: `${100 / Math.min(Object.keys(activeTab === "category" ? categoryRevenue : productRevenue).length, 10)}%`,
                            }}
                            title={`${name}: ${percentage}%`}
                          ></div>
                        )
                      },
                    )}
                  </div>
                </div>
              </div>

              {/* Table */}
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
                            <td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-800 dark:text-white">
                              {name}
                            </td>
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
                        <td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-800 dark:text-white">
                          Phí ship
                        </td>
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
                        <td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-800 dark:text-white">
                          100%
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Revenue
