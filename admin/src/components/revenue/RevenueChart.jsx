"use client"

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts"
import { useState } from "react"
import { BarChart3, PieChartIcon, TrendingUp } from "lucide-react"

const RevenueChart = ({ activeTab, categoryRevenue, productRevenue }) => {
  const [chartType, setChartType] = useState("pie")

  // Get data based on active tab
  const getData = () => {
    const data = activeTab === "category" ? categoryRevenue : productRevenue

    if (!data || Object.keys(data).length === 0) {
      return []
    }

    // Convert to array and sort by revenue
    const sortedData = Object.entries(data)
      .map(([name, revenue]) => ({
        name: name.length > 15 ? `${name.substring(0, 15)}...` : name,
        fullName: name,
        value: revenue,
        revenue: revenue,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8) // Top 8 items

    return sortedData
  }

  const chartData = getData()

  // Enhanced color palette
  const COLORS = [
    "#FF6B6B", // Coral Red
    "#4ECDC4", // Turquoise
    "#45B7D1", // Sky Blue
    "#96CEB4", // Mint Green
    "#FFEAA7", // Warm Yellow
    "#DDA0DD", // Plum
    "#98D8C8", // Seafoam
    "#F7DC6F", // Light Gold
  ]

  // Custom tooltip for pie chart
  const CustomPieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0]
      const total = chartData.reduce((sum, item) => sum + item.value, 0)
      const percentage = ((data.value / total) * 100).toFixed(1)

      return (
        <div className="bg-white dark:bg-dark-light p-4 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700">
          <p className="font-semibold text-gray-800 dark:text-white mb-2">{data.payload.fullName}</p>
          <div className="space-y-1">
            <p className="text-primary font-bold text-lg">{data.value.toLocaleString("vi-VN")} đ</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{percentage}% tổng doanh thu</p>
          </div>
        </div>
      )
    }
    return null
  }

  // Custom tooltip for bar chart
  const CustomBarTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-dark-light p-4 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700">
          <p className="font-semibold text-gray-800 dark:text-white mb-2">{label}</p>
          <p className="text-primary font-bold text-lg">{payload[0].value.toLocaleString("vi-VN")} đ</p>
        </div>
      )
    }
    return null
  }

  // Custom legend
  const CustomLegend = ({ payload }) => {
    return (
      <div className="flex flex-wrap justify-center gap-3 mt-6">
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded-lg">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{entry.value}</span>
          </div>
        ))}
      </div>
    )
  }

  if (chartData.length === 0) {
    return (
      <div className="bg-white dark:bg-dark-light rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center">
          <TrendingUp className="mr-3 text-primary" size={24} />
          Biểu đồ doanh thu theo {activeTab === "category" ? "danh mục" : "sản phẩm"}
        </h3>
        <div className="flex items-center justify-center h-80">
          <div className="text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <PieChartIcon className="w-12 h-12 text-gray-400" />
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
      {/* Header with Chart Type Toggle */}
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center">
          <TrendingUp className="mr-3 text-primary" size={24} />
          Biểu đồ doanh thu theo {activeTab === "category" ? "danh mục" : "sản phẩm"}
        </h3>

        <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
          <button
            onClick={() => setChartType("pie")}
            className={`flex items-center px-4 py-2 rounded-lg transition-all duration-200 ${
              chartType === "pie"
                ? "bg-white dark:bg-dark text-primary shadow-md"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            }`}
          >
            <PieChartIcon size={16} className="mr-2" />
            Tròn
          </button>
          <button
            onClick={() => setChartType("bar")}
            className={`flex items-center px-4 py-2 rounded-lg transition-all duration-200 ${
              chartType === "bar"
                ? "bg-white dark:bg-dark text-primary shadow-md"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            }`}
          >
            <BarChart3 size={16} className="mr-2" />
            Cột
          </button>
        </div>
      </div>

      {/* Chart Container */}
      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === "pie" ? (
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={140}
                paddingAngle={3}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="#fff" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip content={<CustomPieTooltip />} />
              <Legend content={<CustomLegend />} />
            </PieChart>
          ) : (
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#666" />
              <YAxis tick={{ fontSize: 12 }} stroke="#666" tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`} />
              <Tooltip content={<CustomBarTooltip />} />
              <Bar dataKey="revenue" radius={[8, 8, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Chart Statistics */}
      <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-3 gap-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-800 dark:text-white">{chartData.length}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {activeTab === "category" ? "Danh mục" : "Sản phẩm"}
            </p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-800 dark:text-white">
              {chartData.length > 0 ? chartData[0].value.toLocaleString("vi-VN") : 0}đ
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Cao nhất</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-800 dark:text-white">
              {chartData.reduce((sum, item) => sum + item.value, 0).toLocaleString("vi-VN")}đ
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Tổng cộng</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RevenueChart
