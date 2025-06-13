"use client"
import { motion } from "framer-motion"
import { useOrders } from "../../hooks/useOrders"
import OrdersHeader from "../../components/orders/OrdersHeader"
import OrdersList from "../../components/orders/OrdersList"
import EmptyOrdersState from "../../components/orders/EmptyOrdersState"
import OrdersLoadingState from "../../components/orders/OrdersLoadingState"
import AnimatedBackground from "../../components/common/AnimatedBackground"
import { StoreContext } from "../../context/StoreContext"
import { useContext } from "react"

const MyOrders = () => {
  const { url } = useContext(StoreContext)
  const { data, loading, searchTerm, setSearchTerm, filteredOrders, formatDate } = useOrders()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 pt-20 pb-16">
      <AnimatedBackground />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-slate-800/50 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border border-slate-700"
        >
          <OrdersHeader searchTerm={searchTerm} setSearchTerm={setSearchTerm} hasOrders={data.length > 0} />

          <div className="p-6">
            {loading ? (
              <OrdersLoadingState />
            ) : data.length === 0 ? (
              <EmptyOrdersState />
            ) : (
              <OrdersList orders={filteredOrders} url={url} formatDate={formatDate} />
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default MyOrders
