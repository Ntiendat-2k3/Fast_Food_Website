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
import { BarChart3, PieChartIcon, TrendingUp } from 'lucide-react'

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
        value: Number(revenue) || 0,
        revenue: Number(revenue) || 0,
      }))
      .filter(item => item.value > 0) // Only include items with revenue > 0
      .sort((a, b) => b.value - a.value)
      .slice(0, 8) // Top 8 items for better visibility

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
    "#FFB347", // Peach
    "#87CEEB", // Sky Blue Light
  ]

  // Custom tooltip for pie chart
  const CustomPieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0]
      const total = chartData.reduce((sum, item) => sum + item.value, 0)
      const percentage = total > 0 ? ((data.value / total) * 100).toFixed(1) : "0"

      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700">
          <p className="font-semibold text-gray-800 dark:text-white mb-1 text-sm">{data.payload.fullName}</p>
          <div className="space-y-1">
            <p className="text-orange-600 font-bold">{Number(data.value).toLocaleString("vi-VN")} đ</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{percentage}% tổng doanh thu</p>
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
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700">
          <p className="font-semibold text-gray-800 dark:text-white mb-1 text-sm">{label}</p>
          <p className="text-orange-600 font-bold">{Number(payload[0].value).toLocaleString("vi-VN")} đ</p>
        </div>
      )
    }
    return null
  }

  // Custom legend
  const CustomLegend = ({ payload }) => {
    return (
      <div className="flex flex-wrap justify-center gap-2 mt-4">
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-1 bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{entry.value}</span>
          </div>
        ))}
      </div>
    )
  }

  if (chartData.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-base font-bold text-gray-800 dark:text-white mb-4 flex items-center">
          <TrendingUp className="mr-2 text-orange-600" size={18} />
          Biểu đồ doanh thu theo {activeTab === "category" ? "danh mục" : "sản phẩm"}
        </h3>
        <div className="flex items-center justify-center h-48">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <PieChartIcon className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 font-medium">Không có dữ liệu để hiển thị</p>
            <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
              Dữ liệu sẽ xuất hiện khi có đơn hàng hoàn thành
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-200 dark:border-gray-700">
      {/* Header with Chart Type Toggle */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-gray-800 dark:text-white flex items-center">
          <TrendingUp className="mr-2 text-orange-600" size={18} />
          Biểu đồ doanh thu theo {activeTab === "category" ? "danh mục" : "sản phẩm"}
        </h3>

        <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-0.5">
          <button
            onClick={() => setChartType("pie")}
            className={`flex items-center px-2 py-1 rounded-md transition-all duration-200 ${
              chartType === "pie"
                ? "bg-white dark:bg-gray-800 text-orange-600 shadow-md"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            }`}
          >
            <PieChartIcon size={14} className="mr-1" />
            <span className="text-xs">Tròn</span>
          </button>
          <button
            onClick={() => setChartType("bar")}
            className={`flex items-center px-2 py-1 rounded-md transition-all duration-200 ${
              chartType === "bar"
                ? "bg-white dark:bg-gray-800 text-orange-600 shadow-md"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            }`}
          >
            <BarChart3 size={14} className="mr-1" />
            <span className="text-xs">Cột</span>
          </button>
        </div>
      </div>

      {/* Chart Container */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === "pie" ? (
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="#fff" strokeWidth={1} />
                ))}
              </Pie>
              <Tooltip content={<CustomPieTooltip />} />
              <Legend content={<CustomLegend />} />
            </PieChart>
          ) : (
            <BarChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10 }}
                stroke="#666"
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis
                tick={{ fontSize: 10 }}
                stroke="#666"
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
              />
              <Tooltip content={<CustomBarTooltip />} />
              <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Chart Statistics */}
      <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-lg font-bold text-gray-800 dark:text-white">{chartData.length}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {activeTab === "category" ? "Danh mục" : "Sản phẩm"}
            </p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-gray-800 dark:text-white">
              {chartData.length > 0 ? Number(chartData[0].value).toLocaleString("vi-VN") : 0}đ
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Cao nhất</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-gray-800 dark:text-white">
              {chartData.reduce((sum, item) => sum + Number(item.value), 0).toLocaleString("vi-VN")}đ
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Tổng cộng</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RevenueChart
