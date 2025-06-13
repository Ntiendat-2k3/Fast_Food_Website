"use client"
import { motion } from "framer-motion"
import { Trash2, Plus, Minus } from "lucide-react"

const CartItemRow = ({
  itemName,
  item,
  quantity,
  index,
  isSelected,
  url,
  onSelectItem,
  onAddToCart,
  onRemoveFromCart,
  onRemoveFromCartAll,
}) => {
  return (
    <motion.tr
      key={index}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="sm:border-b border-slate-700 block sm:table-row mb-6 sm:mb-0"
    >
      <td className="py-4 sm:table-cell block">
        <div className="flex items-center justify-center sm:justify-start">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onSelectItem(itemName)}
            className="w-4 h-4 text-yellow-400 bg-slate-600 border-slate-500 rounded focus:ring-yellow-400 focus:ring-2"
          />
        </div>
      </td>

      <td className="py-4 flex items-center sm:table-cell">
        <div className="flex items-center">
          <div className="relative">
            <img
              src={url + "/images/" + item.image || "/placeholder.svg"}
              alt={itemName}
              className="w-16 h-16 object-cover rounded-xl mr-4 border border-slate-600"
            />
            <div className="absolute -top-1 -right-1 bg-yellow-400 text-slate-900 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {quantity}
            </div>
          </div>
          <div className="sm:hidden flex flex-col">
            <span className="text-white font-medium">{itemName}</span>
            <span className="text-gray-300 text-sm mt-1">{item.price.toLocaleString("vi-VN")} đ</span>
          </div>
          <span className="hidden sm:block text-white">{itemName}</span>
        </div>
      </td>

      <td className="py-4 text-gray-300 hidden sm:table-cell">{item.price.toLocaleString("vi-VN")} đ</td>

      <td className="py-4 sm:table-cell block">
        <div className="flex items-center justify-between sm:justify-start">
          <span className="sm:hidden text-gray-400">Số lượng:</span>
          <div className="flex items-center bg-slate-700/50 rounded-xl p-1">
            <button
              onClick={() => onRemoveFromCart(itemName)}
              className="w-8 h-8 rounded-lg bg-slate-600 hover:bg-yellow-400 hover:text-slate-900 text-white flex items-center justify-center transition-all duration-200"
              aria-label="Giảm số lượng"
            >
              <Minus size={16} />
            </button>
            <span className="mx-3 text-white min-w-[30px] text-center font-medium">{quantity}</span>
            <button
              onClick={() => onAddToCart(itemName, 1)}
              className="w-8 h-8 rounded-lg bg-slate-600 hover:bg-yellow-400 hover:text-slate-900 text-white flex items-center justify-center transition-all duration-200"
              aria-label="Tăng số lượng"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>
      </td>

      <td className="py-4 text-white font-medium sm:table-cell block">
        <div className="flex justify-between sm:justify-start">
          <span className="sm:hidden text-gray-400">Tổng:</span>
          <span className="text-yellow-400 font-bold">{(item.price * quantity).toLocaleString("vi-VN")} đ</span>
        </div>
      </td>

      <td className="py-4 sm:table-cell block text-right sm:text-left">
        <button
          onClick={() => onRemoveFromCartAll(itemName)}
          className="text-red-400 hover:text-red-300 transition-colors p-2 hover:bg-red-500/10 rounded-lg"
          aria-label="Xóa sản phẩm"
        >
          <Trash2 size={20} />
        </button>
      </td>
    </motion.tr>
  )
}

export default CartItemRow
