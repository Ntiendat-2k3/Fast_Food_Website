"use client"
import { motion } from "framer-motion"
import OrderHeader from "./OrderHeader"
import OrderItemsList from "./OrderItemsList"
import OrderInfo from "./OrderInfo"

const OrderCard = ({ order, index, url, formatDate }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="bg-slate-700/30 backdrop-blur-sm rounded-xl border border-slate-600 overflow-hidden hover:border-primary/50 transition-all duration-300"
    >
      <OrderHeader order={order} formatDate={formatDate} />

      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <OrderItemsList items={order.items} url={url} />
          <OrderInfo order={order} />
        </div>
      </div>
    </motion.div>
  )
}

export default OrderCard
