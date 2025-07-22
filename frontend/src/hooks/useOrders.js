"use client"

import { useState, useEffect, useContext } from "react"
import { StoreContext } from "../context/StoreContext"
import axios from "axios"

export const useOrders = () => {
  const { url, token } = useContext(StoreContext)
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredOrders, setFilteredOrders] = useState([])

  const fetchOrders = async () => {
    if (!token) {
      console.log("No token available")
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      console.log("Fetching orders with token:", token)
      console.log("API URL:", `${url}/api/order/userorders`)

      const response = await axios.post(
        `${url}/api/order/userorders`,
        {},
        {
          headers: {
            token: token, // Sử dụng 'token' thay vì 'Authorization: Bearer'
          },
        },
      )

      console.log("Orders response:", response.data)

      if (response.data.success) {
        // Sắp xếp đơn hàng theo thời gian mới nhất
        const sortedOrders = response.data.data.sort((a, b) => new Date(b.date) - new Date(a.date))
        setData(sortedOrders)
        setFilteredOrders(sortedOrders)
        console.log("Orders loaded:", sortedOrders.length)
      } else {
        console.error("Failed to fetch orders:", response.data.message)
        setData([])
        setFilteredOrders([])
      }
    } catch (error) {
      console.error("Error fetching orders:", error)
      console.error("Error response:", error.response?.data)
      setData([])
      setFilteredOrders([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [token, url])

  useEffect(() => {
    // Filter orders based on search term
    if (searchTerm.trim() === "") {
      setFilteredOrders(data)
    } else {
      const filtered = data.filter(
        (order) =>
          order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.items.some((item) => item.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
          order.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (order.address.name && order.address.name.toLowerCase().includes(searchTerm.toLowerCase())),
      )
      setFilteredOrders(filtered)
    }
  }, [searchTerm, data])

  // Format date function to handle invalid dates
  const formatDate = (dateString) => {
    if (!dateString) return "Không có ngày"

    const date = new Date(dateString)

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return "Ngày không hợp lệ"
    }

    // Format date to Vietnamese format
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Function to confirm delivery
  const confirmDelivery = async (orderId) => {
    if (!token) {
      throw new Error("Không có token xác thực")
    }

    try {
      const response = await axios.post(
        `${url}/api/order/confirm-delivery`,
        { orderId },
        {
          headers: { token: token },
        },
      )

      if (response.data.success) {
        // Refresh orders after confirmation
        await fetchOrders()
        return response.data
      } else {
        throw new Error(response.data.message || "Lỗi khi xác nhận nhận hàng")
      }
    } catch (error) {
      console.error("Error confirming delivery:", error)
      throw error
    }
  }

  return {
    data,
    loading,
    searchTerm,
    setSearchTerm,
    filteredOrders,
    formatDate,
    refetch: fetchOrders,
    confirmDelivery,
  }
}
