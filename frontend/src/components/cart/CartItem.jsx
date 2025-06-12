"use client"

import { useContext } from "react"
import { motion } from "framer-motion"
import { Trash2 } from "lucide-react"
import { StoreContext } from "../../context/StoreContext"
import ImageWithFallback from "../ui/ImageWithFallback"
import QuantitySelector from "../ui/QuantitySelector"
import PriceDisplay from "../ui/PriceDisplay"
import Button from "../common/Button"

const CartItem = ({ itemName, quantity, item, index, isSelected, onSelect, onRemove, viewMode = "desktop" }) => {
  const { url, addToCart, removeFromCart, removeFromCartAll } = useContext(StoreContext)

  const handleQuantityChange = (newQuantity) => {
    const diff = newQuantity - quantity
    if (diff > 0) {
      addToCart(itemName, diff)
    } else if (diff < 0) {
      removeFromCart(itemName, Math.abs(diff))
    }
  }

  if (viewMode === "mobile") {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: index * 0.1 }}
        className="bg-slate-700/30 rounded-xl p-4 border border-slate-600 mb-4"
      >
        <div className="flex items-center mb-3">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onSelect(itemName)}
            className="w-4 h-4 text-primary bg-slate-600 border-slate-500 rounded focus:ring-primary focus:ring-2 mr-3"
          />
          <div className="flex-1">
            <h3 className="text-white font-medium">{itemName}</h3>
            <PriceDisplay price={item.price} size="sm" />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <ImageWithFallback
            src={`${url}/images/${item.image}`}
            alt={itemName}
            className="w-16 h-16 object-cover rounded-lg"
            containerClassName="w-16 h-16 border border-slate-600 rounded-lg overflow-hidden"
          />

          <div className="flex items-center gap-3">
            <QuantitySelector value={quantity} onChange={handleQuantityChange} size="sm" />

            <Button onClick={() => onRemove(itemName)} variant="danger" size="sm" icon={<Trash2 size={16} />} />
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-600 flex justify-between items-center">
          <span className="text-gray-400 text-sm">Tổng:</span>
          <PriceDisplay price={item.price * quantity} size="md" className="text-primary font-bold" />
        </div>
      </motion.div>
    )
  }

  return (
    <motion.tr
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="border-b border-slate-700"
    >
      <td className="py-4">
        <div className="flex items-center justify-center">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onSelect(itemName)}
            className="w-4 h-4 text-primary bg-slate-600 border-slate-500 rounded focus:ring-primary focus:ring-2"
          />
        </div>
      </td>

      <td className="py-4">
        <div className="flex items-center">
          <div className="relative mr-4">
            <ImageWithFallback
              src={`${url}/images/${item.image}`}
              alt={itemName}
              className="w-16 h-16 object-cover rounded-xl"
              containerClassName="w-16 h-16 border border-slate-600 rounded-xl overflow-hidden"
            />
            <div className="absolute -top-1 -right-1 bg-primary text-slate-900 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {quantity}
            </div>
          </div>
          <span className="text-white font-medium">{itemName}</span>
        </div>
      </td>

      <td className="py-4">
        <PriceDisplay price={item.price} size="sm" />
      </td>

      <td className="py-4">
        <QuantitySelector value={quantity} onChange={handleQuantityChange} />
      </td>

      <td className="py-4">
        <PriceDisplay price={item.price * quantity} size="md" className="text-primary font-bold" />
      </td>

      <td className="py-4 text-right">
        <Button
          onClick={() => onRemove(itemName)}
          variant="ghost"
          size="sm"
          icon={<Trash2 size={20} />}
          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
        />
      </td>
    </motion.tr>
  )
}

export default CartItem
