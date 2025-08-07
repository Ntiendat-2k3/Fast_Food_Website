"use client"

import { useEffect, useState } from "react"
import { toast } from "react-toastify"
import axios from "axios"
import { TrendingUp, Calendar, BarChart3, LineChart } from 'lucide-react'

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

  // Fetch revenue breakdown from new API endpoint
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
          totalRevenue: data.totalRevenue
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

  // Fetch orders for time-based statistics
  const fetchOrders = async () => {
    try {
      const response = await axios.get(url + "/api/order/list")
      if (response.data.success) {
        const allOrders = response.data.data
        setOrders(allOrders)

        // Filter only completed orders for time stats
        const completed = allOrders.filter((order) =>
          order.status === "Đã giao" || order.status === "Đã hoàn thành"
        )
        setCompletedOrders(completed)
      }
    } catch (error) {
      console.error("Error fetching orders:", error)
    }
  }

  // Generate time-based stats from completed orders only
  const generateTimeStats = () => {
    const stats = []

    if (period === "day") {
      // Generate stats for each day of the month
      const daysInMonth = new Date(year, month, 0).getDate()
      for (let day = 1; day <= daysInMonth; day++) {
        const dayOrders = completedOrders.filter((order) => {
          const orderDate = new Date(order.date)
          return orderDate.getFullYear() === year &&
            orderDate.getMonth() + 1 === month &&
            orderDate.getDate() === day &&
            (order.status === "Đã giao" || order.status === "Đã hoàn thành")
        })

        const revenue = dayOrders.reduce((sum, order) => sum + (Number(order.amount) || 0), 0)
        stats.push({
          period: `${day}/${month}`,
          revenue,
          orders: dayOrders.length,
        })
      }
    } else if (period === "month") {
      // Generate stats for each month of the year
      for (let monthNum = 1; monthNum <= 12; monthNum++) {
        const monthOrders = completedOrders.filter((order) => {
          const orderDate = new Date(order.date)
          return orderDate.getFullYear() === year && orderDate.getMonth() + 1 === monthNum
        })

        const revenue = monthOrders.reduce((sum, order) => sum + (Number(order.amount) || 0), 0)
        const monthNames = ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10", "T11", "T12"]
        stats.push({
          period: monthNames[monthNum - 1],
          revenue,
          orders: monthOrders.length,
        })
      }
    } else if (period === "year") {
      // Generate stats for recent years
      const currentYear = new Date().getFullYear()
      for (let yearNum = currentYear - 4; yearNum <= currentYear; yearNum++) {
        const yearOrders = completedOrders.filter((order) => {
          const orderDate = new Date(order.date)
          return orderDate.getFullYear() === yearNum
        })

        const revenue = yearOrders.reduce((sum, order) => sum + (Number(order.amount) || 0), 0)
        stats.push({
          period: yearNum.toString(),
          revenue,
          orders: yearOrders.length,
        })
      }
    }

    setTimeStats(stats)
  }

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      console.log("Loading revenue data...")
      await Promise.all([
        fetchRevenueBreakdown(),
        fetchOrders()
      ])
    }
    loadData()
  }, [])

  useEffect(() => {
    if (completedOrders.length > 0) {
      generateTimeStats()
    } else {
      setTimeStats([])
    }
  }, [completedOrders, period, year, month])

  // Compact Time Filter Component
  const TimeFilter = () => (
    <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 p-2 rounded-lg border border-gray-200 dark:border-gray-700">
      <Calendar size={14} className="text-gray-500" />

      {/* Period Selector */}
      <select
        value={period}
        onChange={(e) => setPeriod(e.target.value)}
        className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
      >
        <option value="day">Theo ngày</option>
        <option value="month">Theo tháng</option>
        <option value="year">Theo năm</option>
      </select>

      {/* Year Selector */}
      <select
        value={year}
        onChange={(e) => setYear(Number.parseInt(e.target.value))}
        className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
      >
        {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>

      {/* Month Selector (only show when period is 'day') */}
      {period === "day" && (
        <select
          value={month}
          onChange={(e) => setMonth(Number.parseInt(e.target.value))}
          className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
        >
          {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
            <option key={m} value={m}>
              T{m}
            </option>
          ))}
        </select>
      )}
    </div>
  )

  // Compact Time Chart Component
  const TimeChart = () => {
    if (timeStats.length === 0) return null

    const maxRevenue = Math.max(...timeStats.map((stat) => stat.revenue))
    if (maxRevenue === 0) return null

    return (
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-base font-semibold text-gray-800 dark:text-white mb-3">
          Doanh thu theo {period === "day" ? "ngày" : period === "month" ? "tháng" : "năm"}
        </h3>

        <div className="space-y-2">
          {timeStats.slice(0, 8).map((stat, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-xs text-gray-600 dark:text-gray-400 w-12">{stat.period}</span>
              <div className="flex-1 mx-2">
                <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                  <div
                    className="bg-orange-500 rounded-full h-1.5 transition-all duration-300"
                    style={{
                      width: maxRevenue > 0 ? `${(stat.revenue / maxRevenue) * 100}%` : "0%",
                    }}
                  />
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-medium text-gray-800 dark:text-white">
                  {Number(stat.revenue).toLocaleString("vi-VN")}đ
                </div>
                <div className="text-xs text-gray-500">{stat.orders}</div>
              </div>
            </div>
          ))}
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

          <div className="flex items-center space-x-2">
            {/* Chart Type Toggle */}
            <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-0.5">
              <button
                onClick={() => setChartType("bar")}
                className={`p-1.5 rounded-md transition-colors ${
                  chartType === "bar"
                    ? "bg-white dark:bg-gray-800 text-orange-600 shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                }`}
              >
                <BarChart3 size={14} />
              </button>
              <button
                onClick={() => setChartType("line")}
                className={`p-1.5 rounded-md transition-colors ${
                  chartType === "line"
                    ? "bg-white dark:bg-gray-800 text-orange-600 shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                }`}
              >
                <LineChart size={14} />
              </button>
            </div>

            {/* Time Filter */}
            <TimeFilter />

            {/* Refresh Button */}
            <button
              onClick={fetchRevenueBreakdown}
              className="px-3 py-1.5 bg-orange-600 text-white rounded-lg text-xs hover:bg-orange-700 transition-colors"
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
            <div className="mb-4">
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

            {/* Debug Information */}
            {/* {process.env.NODE_ENV === 'development' && (
              <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <h4 className="font-bold mb-2">Debug Info:</h4>
                <div className="text-xs space-y-1">
                  <div>Total Categories: {Object.keys(categoryRevenue).length}</div>
                  <div>Total Products: {Object.keys(productRevenue).length}</div>
                  <div>Category Revenue: {JSON.stringify(categoryRevenue, null, 2).substring(0, 200)}...</div>
                </div>
              </div>
            )} */}
          </>
        )}
      </div>
    </div>
  )
}

export default Revenue
