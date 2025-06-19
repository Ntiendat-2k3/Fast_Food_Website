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
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [categoryRevenue, setCategoryRevenue] = useState({})
  const [productRevenue, setProductRevenue] = useState({})
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("category")

  // Time filter states
  const [period, setPeriod] = useState("month")
  const [year, setYear] = useState(new Date().getFullYear())
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [timeStats, setTimeStats] = useState([])
  const [chartType, setChartType] = useState("bar")

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

  // Generate time-based stats from existing orders
  const generateTimeStats = () => {
    const stats = []
    const now = new Date()

    if (period === "day") {
      // Generate stats for each day of the month
      const daysInMonth = new Date(year, month, 0).getDate()
      for (let day = 1; day <= daysInMonth; day++) {
        const dayOrders = orders.filter((order) => {
          const orderDate = new Date(order.date)
          return orderDate.getFullYear() === year && orderDate.getMonth() + 1 === month && orderDate.getDate() === day
        })

        const revenue = dayOrders.reduce((sum, order) => sum + order.amount, 0)
        stats.push({
          period: `${day}/${month}`,
          revenue,
          orders: dayOrders.length,
        })
      }
    } else if (period === "month") {
      // Generate stats for each month of the year
      for (let monthNum = 1; monthNum <= 12; monthNum++) {
        const monthOrders = orders.filter((order) => {
          const orderDate = new Date(order.date)
          return orderDate.getFullYear() === year && orderDate.getMonth() + 1 === monthNum
        })

        const revenue = monthOrders.reduce((sum, order) => sum + order.amount, 0)
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
        const yearOrders = orders.filter((order) => {
          const orderDate = new Date(order.date)
          return orderDate.getFullYear() === yearNum
        })

        const revenue = yearOrders.reduce((sum, order) => sum + order.amount, 0)
        stats.push({
          period: yearNum.toString(),
          revenue,
          orders: yearOrders.length,
        })
      }
    }

    setTimeStats(stats)
  }

  useEffect(() => {
    fetchAllOrders()
  }, [])

  useEffect(() => {
    if (orders.length > 0) {
      generateTimeStats()
    }
  }, [orders, period, year, month])

  // Simple Time Filter Component
  const TimeFilter = () => (
    <div className="flex items-center space-x-3 bg-white dark:bg-dark-light p-3 rounded-lg border border-gray-200 dark:border-gray-700">
      <Calendar size={16} className="text-gray-500" />

      {/* Period Selector */}
      <select
        value={period}
        onChange={(e) => setPeriod(e.target.value)}
        className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary"
      >
        <option value="day">Theo ngày</option>
        <option value="month">Theo tháng</option>
        <option value="year">Theo năm</option>
      </select>

      {/* Year Selector */}
      <select
        value={year}
        onChange={(e) => setYear(Number.parseInt(e.target.value))}
        className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary"
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
          className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
            <option key={m} value={m}>
              Tháng {m}
            </option>
          ))}
        </select>
      )}
    </div>
  )

  // Simple Time Chart Component
  const TimeChart = () => {
    if (timeStats.length === 0) return null

    const maxRevenue = Math.max(...timeStats.map((stat) => stat.revenue))

    return (
      <div className="bg-white dark:bg-dark-light p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          Doanh thu theo {period === "day" ? "ngày" : period === "month" ? "tháng" : "năm"}
        </h3>

        <div className="space-y-3">
          {timeStats.map((stat, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400 w-16">{stat.period}</span>
              <div className="flex-1 mx-3">
                <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-primary rounded-full h-2 transition-all duration-300"
                    style={{
                      width: maxRevenue > 0 ? `${(stat.revenue / maxRevenue) * 100}%` : "0%",
                    }}
                  />
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-800 dark:text-white">
                  {stat.revenue.toLocaleString("vi-VN")}đ
                </div>
                <div className="text-xs text-gray-500">{stat.orders} đơn</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="bg-white dark:bg-dark-light md:rounded-2xl md:shadow-custom p-3 md:p-6 mb-4 md:mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <h1 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white mb-4 md:mb-0 flex items-center">
            <TrendingUp className="mr-2" size={24} />
            Thống kê doanh thu
          </h1>

          <div className="flex items-center space-x-3">
            {/* Chart Type Toggle */}
            <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setChartType("bar")}
                className={`p-2 rounded-md transition-colors ${
                  chartType === "bar"
                    ? "bg-white dark:bg-dark text-primary shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                }`}
              >
                <BarChart3 size={16} />
              </button>
              <button
                onClick={() => setChartType("line")}
                className={`p-2 rounded-md transition-colors ${
                  chartType === "line"
                    ? "bg-white dark:bg-dark text-primary shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                }`}
              >
                <LineChart size={16} />
              </button>
            </div>

            {/* Time Filter */}
            <TimeFilter />
          </div>
        </div>

        {loading ? (
          <LoadingState />
        ) : (
          <>
            {/* Revenue Summary Cards */}
            <RevenueSummaryCards totalRevenue={totalRevenue} orders={orders} />

            {/* Time-based Revenue Chart */}
            <div className="mb-6">
              <TimeChart />
            </div>

            {/* Revenue Tabs */}
            <RevenueTabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

            {/* Revenue Charts and Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              {/* Chart */}
              <RevenueChart activeTab={activeTab} categoryRevenue={categoryRevenue} productRevenue={productRevenue} />

              {/* Table */}
              <RevenueTable
                activeTab={activeTab}
                categoryRevenue={categoryRevenue}
                productRevenue={productRevenue}
                totalRevenue={totalRevenue}
                orders={orders}
              />
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Revenue
