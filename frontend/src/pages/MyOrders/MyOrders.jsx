"use client"
import { motion } from "framer-motion"
import { useOrders } from "../../hooks/useOrders"
import OrdersHeader from "../../components/orders/OrdersHeader"
import OrdersList from "../../components/orders/OrdersList"
import EmptyOrdersState from "../../components/orders/EmptyOrdersState"
import OrdersLoadingState from "../../components/orders/OrdersLoadingState"
import AnimatedBackground from "../../components/common/AnimatedBackground"
import { StoreContext } from "../../context/StoreContext"
import { useContext, useEffect } from "react"
import { Toaster } from "react-hot-toast"

const MyOrders = () => {
  const { url, token } = useContext(StoreContext)
  const { data, loading, searchTerm, setSearchTerm, filteredOrders, formatDate, refetch, confirmDelivery } = useOrders()

  // Debug logging
  useEffect(() => {
    console.log("MyOrders - Token:", token)
    console.log("MyOrders - Data:", data)
    console.log("MyOrders - Loading:", loading)
  }, [token, data, loading])

  const handleOrderUpdate = () => {
    // Refetch orders khi có cập nhật
    refetch()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 pt-20 pb-16">
      <AnimatedBackground />
      <Toaster position="top-right" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-slate-800/50 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border border-yellow-500/30"
        >
          <OrdersHeader searchTerm={searchTerm} setSearchTerm={setSearchTerm} hasOrders={data.length > 0} />

          <div className="p-6">
            {loading ? (
              <OrdersLoadingState />
            ) : data.length === 0 ? (
              <EmptyOrdersState />
            ) : (
              <OrdersList
                orders={filteredOrders}
                url={url}
                formatDate={formatDate}
                onOrderUpdate={handleOrderUpdate}
                confirmDelivery={confirmDelivery}
              />
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default MyOrders
