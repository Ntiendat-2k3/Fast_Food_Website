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
  const [categories, setCategories] = useState([])
  const [vouchers, setVouchers] = useState([])
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

  // Fetch categories from API
  const fetchCategories = async () => {
    try {
      const response = await axios.get(url + "/api/category/list")
      if (response.data.success) {
        setCategories(response.data.data)
        console.log("Categories loaded:", response.data.data)
      } else {
        console.error("Failed to fetch categories")
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }

  // Fetch vouchers from API
  const fetchVouchers = async () => {
    try {
      const response = await axios.get(url + "/api/voucher/list")
      if (response.data.success) {
        setVouchers(response.data.data)
        console.log("Vouchers loaded:", response.data.data)
      } else {
        console.error("Failed to fetch vouchers")
      }
    } catch (error) {
      console.error("Error fetching vouchers:", error)
    }
  }

  // Function to find category name by ID
  const getCategoryNameById = (categoryId) => {
    if (!categoryId || !categories.length) return "Khác"

    const category = categories.find((cat) => cat._id === categoryId)
    return category ? category.name : "Khác"
  }

  // Function to calculate voucher discount amount
  const calculateVoucherDiscount = (voucherCode, orderAmount) => {
    if (!voucherCode || !vouchers.length) return 0

    const voucher = vouchers.find((v) => v.code === voucherCode)
    if (!voucher) return 0

    console.log("Found voucher:", voucher)

    // Calculate discount based on voucher type
    if (voucher.discountType === "percentage") {
      const discount = (orderAmount * voucher.discountValue) / 100
      // Apply max discount limit if exists
      return voucher.maxDiscount ? Math.min(discount, voucher.maxDiscount) : discount
    } else if (voucher.discountType === "fixed") {
      return voucher.discountValue
    }

    return 0
  }

  // Fetch all orders from API
  const fetchAllOrders = async () => {
    setLoading(true)
    try {
      const response = await axios.get(url + "/api/order/list")
      if (response.data.success) {
        const allOrders = response.data.data
        setOrders(allOrders)

        // Filter only completed orders for revenue calculation
        const completed = allOrders.filter((order) => order.status === "Đã giao")
        setCompletedOrders(completed)

        // Calculate total revenue from completed orders only
        const total = completed.reduce((sum, order) => sum + order.amount, 0)
        setTotalRevenue(total)

        // Calculate total voucher discount from completed orders using voucher data
        const voucherDiscount = completed.reduce((sum, order) => {
          // First try to get from order data
          let discount = order.voucherDiscount || order.discountAmount || 0

          // If not available, calculate from voucher code and order amount
          if (discount === 0 && order.voucherCode) {
            discount = calculateVoucherDiscount(order.voucherCode, order.amount)
            console.log(`Calculated discount for order ${order._id}: ${discount}đ (voucher: ${order.voucherCode})`)
          }

          return sum + discount
        }, 0)
        setTotalVoucherDiscount(voucherDiscount)

        // Calculate total shipping fee from completed orders
        const shippingFee = completed.reduce((sum, order) => {
          const fee = order.shippingFee || order.deliveryFee || 14000
          return sum + fee
        }, 0)
        setTotalShippingFee(shippingFee)

        // Calculate revenue by category and product from completed orders only
        const categoryRev = {}
        const productRev = {}

        completed.forEach((order) => {
          console.log("Processing order:", order._id, "Items:", order.items)

          if (order.items && Array.isArray(order.items)) {
            order.items.forEach((item) => {
              console.log("Processing item:", item)

              // Ensure item has required properties
              if (item.name && item.price && item.quantity) {
                const itemRevenue = item.price * item.quantity

                // Get category name using the mapping function
                const categoryName = getCategoryNameById(item.category)
                console.log("Item category ID:", item.category, "Category name:", categoryName)

                // Revenue by category
                if (!categoryRev[categoryName]) {
                  categoryRev[categoryName] = 0
                }
                categoryRev[categoryName] += itemRevenue

                // Revenue by product
                if (!productRev[item.name]) {
                  productRev[item.name] = 0
                }
                productRev[item.name] += itemRevenue
              }
            })
          }
        })

        console.log("Final Category Revenue:", categoryRev)
        console.log("Final Product Revenue:", productRev)
        console.log("Total Voucher Discount:", voucherDiscount)
        console.log("Total Shipping Fee:", shippingFee)

        setCategoryRevenue(categoryRev)
        setProductRevenue(productRev)
      } else {
        toast.error("Error fetching orders")
      }
    } catch (error) {
      console.error("Error fetching orders:", error)
      toast.error("Error connecting to server")
    } finally {
      setLoading(false)
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
        const monthOrders = completedOrders.filter((order) => {
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
        const yearOrders = completedOrders.filter((order) => {
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

  // Load categories and vouchers first, then orders
  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchCategories(), fetchVouchers()])
    }
    loadData()
  }, [])

  // Fetch orders after categories and vouchers are loaded
  useEffect(() => {
    if (categories.length > 0 && vouchers.length >= 0) {
      fetchAllOrders()
    }
  }, [categories, vouchers])

  useEffect(() => {
    if (completedOrders.length > 0) {
      generateTimeStats()
    } else {
      setTimeStats([])
    }
  }, [completedOrders, period, year, month])

  // Compact Time Filter Component
  const TimeFilter = () => (
    <div className="flex items-center space-x-2 bg-white dark:bg-dark-light p-2 rounded-lg border border-gray-200 dark:border-gray-700">
      <Calendar size={14} className="text-gray-500" />

      {/* Period Selector */}
      <select
        value={period}
        onChange={(e) => setPeriod(e.target.value)}
        className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-dark text-xs focus:outline-none focus:ring-1 focus:ring-primary"
      >
        <option value="day">Theo ngày</option>
        <option value="month">Theo tháng</option>
        <option value="year">Theo năm</option>
      </select>

      {/* Year Selector */}
      <select
        value={year}
        onChange={(e) => setYear(Number.parseInt(e.target.value))}
        className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-dark text-xs focus:outline-none focus:ring-1 focus:ring-primary"
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
          className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-dark text-xs focus:outline-none focus:ring-1 focus:ring-primary"
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
      <div className="bg-white dark:bg-dark-light p-4 rounded-lg border border-gray-200 dark:border-gray-700">
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
                    className="bg-primary rounded-full h-1.5 transition-all duration-300"
                    style={{
                      width: maxRevenue > 0 ? `${(stat.revenue / maxRevenue) * 100}%` : "0%",
                    }}
                  />
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-medium text-gray-800 dark:text-white">
                  {stat.revenue.toLocaleString("vi-VN")}đ
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
      <div className="bg-white dark:bg-dark-light md:rounded-xl md:shadow-custom p-2 md:p-4 mb-3 md:mb-6">
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
                    ? "bg-white dark:bg-dark text-primary shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                }`}
              >
                <BarChart3 size={14} />
              </button>
              <button
                onClick={() => setChartType("line")}
                className={`p-1.5 rounded-md transition-colors ${
                  chartType === "line"
                    ? "bg-white dark:bg-dark text-primary shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                }`}
              >
                <LineChart size={14} />
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
            {/* Revenue Summary Cards - using completed orders only */}
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
          </>
        )}
      </div>
    </div>
  )
}

export default Revenue
