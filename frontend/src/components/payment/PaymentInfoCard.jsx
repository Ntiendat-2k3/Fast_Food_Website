"use client"

import { motion } from "framer-motion"
import CopyableField from "./CopyableField"

const PaymentInfoCard = ({ title, icon: Icon, fields }) => {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 100 }}
      className="bg-slate-700/30 backdrop-blur-md p-6 rounded-xl mb-6 border border-slate-600/50"
    >
      <div className="flex items-center mb-5">
        {Icon && <Icon size={24} className="text-primary mr-3" />}
        <h3 className="text-lg font-medium text-white">{title}</h3>
      </div>
      <div className="space-y-4">
        {fields.map((field, index) => (
          <CopyableField key={index} label={field.label} value={field.value} copyable={field.copyable !== false} />
        ))}
      </div>
    </motion.div>
  )
}

export default PaymentInfoCard
