"use client"

import { useEffect, useState } from "react"
import { toast } from "react-toastify"
import axios from "axios"
import { TrendingUp } from "lucide-react"

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

  return (
    <div className="w-full">
      <div className="bg-white dark:bg-dark-light md:rounded-2xl md:shadow-custom p-3 md:p-6 mb-4 md:mb-8">
        <h1 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white mb-4 md:mb-6 flex items-center">
          <TrendingUp className="mr-2" size={24} />
          Thống kê doanh thu
        </h1>

        {loading ? (
          <LoadingState />
        ) : (
          <>
            {/* Revenue Summary Cards */}
            <RevenueSummaryCards totalRevenue={totalRevenue} orders={orders} />

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
