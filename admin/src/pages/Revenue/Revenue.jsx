"use client"

import { useEffect, useState } from "react"
import { toast } from "react-toastify"
import axios from "axios"
import { TrendingUp, Calendar, BarChart3, LineChart } from "lucide-react"

import RevenueSummaryCards from "../../components/revenue/RevenueSummaryCards"
import RevenueTabNavigation from "../../components/revenue/RevenueTabNavigation"
import RevenueChart from "../../components/revenue/RevenueChart"
import RevenueTable from "../../components/revenue/RevenueTable"
import LoadingState from "../../components/revenue/LoadingState"

const Revenue = ({ url }) => {
  const [orders, setOrders] = useState([])
  const [completedOrders, setCompletedOrders] = useState([])
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [categoryRevenue, setCategoryRevenue] = useState({})
  const [productRevenue, setProductRevenue] = useState({})
  const [totalVoucherDiscount, setTotalVoucherDiscount] = useState(0)
  const [totalShippingFee, setTotalShippingFee] = useState(0)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("category")

  // Time filter states
  const [period, setPeriod] = useState("month")
  const [year, setYear] = useState(new Date().getFullYear())
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [timeStats, setTimeStats] = useState([])
  const [chartType, setChartType] = useState("bar")

  // Fetch revenue breakdown from API endpoint
  const fetchRevenueBreakdown = async () => {
    setLoading(true)
    try {
      console.log("Fetching revenue breakdown...")
      const response = await axios.get(url + "/api/order/revenue-breakdown")

      if (response.data.success) {
        const data = response.data.data
        console.log("Revenue breakdown received:", data)

        setCategoryRevenue(data.categoryRevenue || {})
        setProductRevenue(data.productRevenue || {})
        setTotalRevenue(data.totalRevenue || 0)
        setTotalVoucherDiscount(data.totalVoucherDiscount || 0)
        setTotalShippingFee(data.totalShippingFee || 0)

        // Set completed orders count for display
        setCompletedOrders(Array(data.orderCount || 0).fill({}))

        console.log("State updated with:", {
          categoryRevenue: data.categoryRevenue,
          productRevenue: data.productRevenue,
          totalRevenue: data.totalRevenue,
        })
      } else {
        toast.error("Lỗi khi tải dữ liệu doanh thu")
        console.error("API returned error:", response.data.message)
      }
    } catch (error) {
      console.error("Error fetching revenue breakdown:", error)
      toast.error("Lỗi kết nối đến server")
    } finally {
      setLoading(false)
    }
  }

  // Fetch time-based revenue statistics
  const fetchTimeStats = async () => {
    try {
      console.log("Fetching time stats with params:", { period, year, month })

      const params = new URLSearchParams({
        period,
        year: year.toString(),
      })

      if (period === "day") {
        params.append("month", month.toString())
      }

      const response = await axios.get(`${url}/api/order/revenue-stats?${params}`)

      if (response.data.success) {
        console.log("Time stats received:", response.data.data)
        setTimeStats(response.data.data || [])
      } else {
        console.error("Error fetching time stats:", response.data.message)
        setTimeStats([])
      }
    } catch (error) {
      console.error("Error fetching time stats:", error)
      setTimeStats([])
    }
  }

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      console.log("Loading revenue data...")
      await fetchRevenueBreakdown()
    }
    loadData()
  }, [])

  // Fetch time stats when time filter changes
  useEffect(() => {
    fetchTimeStats()
  }, [period, year, month])

  // Apply time filter
  const handleApplyTimeFilter = () => {
    fetchTimeStats()
    toast.success("Đã cập nhật thống kê theo thời gian")
  }

  // Enhanced Time Filter Component
  const TimeFilter = () => (
    <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
      <Calendar size={16} className="text-gray-500" />

      {/* Period Selector */}
      <select
        value={period}
        onChange={(e) => setPeriod(e.target.value)}
        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
      >
        <option value="day">Theo ngày</option>
        <option value="month">Theo tháng</option>
        <option value="year">Theo năm</option>
      </select>

      {/* Year Selector */}
      {(period === "day" || period === "month") && (
        <select
          value={year}
          onChange={(e) => setYear(Number.parseInt(e.target.value))}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      )}

      {/* Month Selector (only show when period is 'day') */}
      {period === "day" && (
        <select
          value={month}
          onChange={(e) => setMonth(Number.parseInt(e.target.value))}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
            <option key={m} value={m}>
              Tháng {m}
            </option>
          ))}
        </select>
      )}

      {/* Apply Button */}
      <button
        onClick={handleApplyTimeFilter}
        className="px-4 py-2 bg-orange-600 text-white rounded-md text-sm hover:bg-orange-700 transition-colors"
      >
        Áp dụng
      </button>
    </div>
  )

  // Enhanced Time Chart Component
  const TimeChart = () => {
    if (timeStats.length === 0) {
      return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            Doanh thu theo {period === "day" ? "ngày" : period === "month" ? "tháng" : "năm"}
          </h3>
          <div className="text-center text-gray-500 py-8">Không có dữ liệu thống kê cho khoảng thời gian này</div>
        </div>
      )
    }

    const maxRevenue = Math.max(...timeStats.map((stat) => stat.revenue))
    const maxOrders = Math.max(...timeStats.map((stat) => stat.orders))

    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            Doanh thu theo {period === "day" ? "ngày" : period === "month" ? "tháng" : "năm"}
            {period === "day" && ` - Tháng ${month}/${year}`}
            {period === "month" && ` - Năm ${year}`}
          </h3>

          {/* Chart Type Toggle */}
          <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setChartType("bar")}
              className={`p-2 rounded-md transition-colors ${
                chartType === "bar"
                  ? "bg-white dark:bg-gray-800 text-orange-600 shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              }`}
            >
              <BarChart3 size={16} />
            </button>
            <button
              onClick={() => setChartType("line")}
              className={`p-2 rounded-md transition-colors ${
                chartType === "line"
                  ? "bg-white dark:bg-gray-800 text-orange-600 shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              }`}
            >
              <LineChart size={16} />
            </button>
          </div>
        </div>

        {/* Chart Display */}
        <div className="space-y-3">
          {timeStats.map((stat, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-16">
                  {period === "day" ? `${stat.period}/${month}` : period === "month" ? `T${stat.period}` : stat.period}
                </span>
                <div className="flex-1 mx-4">
                  <div className="bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                    <div
                      className="bg-orange-500 rounded-full h-2 transition-all duration-300"
                      style={{
                        width: maxRevenue > 0 ? `${(stat.revenue / maxRevenue) * 100}%` : "0%",
                      }}
                    />
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-gray-800 dark:text-white">
                  {Number(stat.revenue).toLocaleString("vi-VN")}đ
                </div>
                <div className="text-xs text-gray-500">{stat.orders} đơn hàng</div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-orange-600">
                {timeStats.reduce((sum, stat) => sum + stat.revenue, 0).toLocaleString("vi-VN")}đ
              </div>
              <div className="text-xs text-gray-500">Tổng doanh thu</div>
            </div>
            <div>
              <div className="text-lg font-bold text-blue-600">
                {timeStats.reduce((sum, stat) => sum + stat.orders, 0)}
              </div>
              <div className="text-xs text-gray-500">Tổng đơn hàng</div>
            </div>
            <div>
              <div className="text-lg font-bold text-green-600">
                {timeStats.length > 0
                  ? Math.round(
                      timeStats.reduce((sum, stat) => sum + stat.revenue, 0) / timeStats.length,
                    ).toLocaleString("vi-VN")
                  : 0}
                đ
              </div>
              <div className="text-xs text-gray-500">Trung bình</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="bg-white dark:bg-gray-800 md:rounded-xl md:shadow-lg p-2 md:p-4 mb-3 md:mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
          <h1 className="text-lg md:text-xl font-bold text-gray-800 dark:text-white mb-3 md:mb-0 flex items-center">
            <TrendingUp className="mr-2" size={20} />
            Thống kê doanh thu
          </h1>

          <div className="flex items-center space-x-3">
            {/* Time Filter */}
            <TimeFilter />

            {/* Refresh Button */}
            <button
              onClick={fetchRevenueBreakdown}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm hover:bg-orange-700 transition-colors"
              disabled={loading}
            >
              {loading ? "Đang tải..." : "Làm mới"}
            </button>
          </div>
        </div>

        {loading ? (
          <LoadingState />
        ) : (
          <>
            {/* Revenue Summary Cards */}
            <RevenueSummaryCards
              totalRevenue={totalRevenue}
              orders={completedOrders}
              totalVoucherDiscount={totalVoucherDiscount}
              totalShippingFee={totalShippingFee}
            />

            {/* Time-based Revenue Chart */}
            <div className="mb-6">
              <TimeChart />
            </div>

            {/* Revenue Tabs */}
            <RevenueTabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

            {/* Revenue Charts and Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4">
              {/* Chart */}
              <RevenueChart activeTab={activeTab} categoryRevenue={categoryRevenue} productRevenue={productRevenue} />

              {/* Table */}
              <RevenueTable
                activeTab={activeTab}
                categoryRevenue={categoryRevenue}
                productRevenue={productRevenue}
                totalRevenue={totalRevenue}
                orders={completedOrders}
                totalVoucherDiscount={totalVoucherDiscount}
                totalShippingFee={totalShippingFee}
              />
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Revenue
