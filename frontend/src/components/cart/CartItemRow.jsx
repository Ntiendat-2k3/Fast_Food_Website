"use client"
import { motion } from "framer-motion"
import { Trash2, Plus, Minus } from 'lucide-react'

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
    <motion.div
      key={index}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="bg-slate-800/50 backdrop-blur-xl rounded-xl overflow-hidden shadow-lg border border-slate-700 hover:border-yellow-400/30 transition-all duration-300"
    >
      {/* Mobile Layout */}
      <div className="sm:hidden">
        <div className="p-4">
          <div className="flex items-start gap-3">
            {/* Checkbox */}
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onSelectItem(itemName)}
              className="w-4 h-4 text-yellow-400 bg-slate-600 border-slate-500 rounded focus:ring-yellow-400 focus:ring-2 mt-1"
            />

            {/* Product Image */}
            <div className="relative flex-shrink-0">
              <img
                src={url + "/images/" + item.image || "/placeholder.svg"}
                alt={itemName}
                className="w-16 h-16 object-cover rounded-xl border border-slate-600"
              />
              <div className="absolute -top-2 -right-2 bg-yellow-400 text-slate-900 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {quantity}
              </div>
            </div>

            {/* Product Info */}
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-white text-sm line-clamp-2 mb-1">
                {itemName}
              </h3>
              <p className="text-yellow-400 font-semibold text-sm mb-3">
                {item.price.toLocaleString("vi-VN")} đ
              </p>

              {/* Quantity Controls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center bg-slate-700/50 rounded-xl p-1">
                  <button
                    onClick={() => onRemoveFromCart(itemName)}
                    className="w-7 h-7 rounded-lg bg-slate-600 hover:bg-yellow-400 hover:text-slate-900 text-white flex items-center justify-center transition-all duration-200"
                    aria-label="Giảm số lượng"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="mx-3 text-white min-w-[24px] text-center font-medium text-sm">
                    {quantity}
                  </span>
                  <button
                    onClick={() => onAddToCart(itemName, 1)}
                    className="w-7 h-7 rounded-lg bg-slate-600 hover:bg-yellow-400 hover:text-slate-900 text-white flex items-center justify-center transition-all duration-200"
                    aria-label="Tăng số lượng"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                <button
                  onClick={() => onRemoveFromCartAll(itemName)}
                  className="text-red-400 hover:text-red-300 transition-colors p-2 hover:bg-red-500/10 rounded-lg"
                  aria-label="Xóa sản phẩm"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Total Price */}
          <div className="mt-3 pt-3 border-t border-slate-700 flex justify-between items-center">
            <span className="text-gray-400 text-sm">Tổng tiền:</span>
            <span className="text-yellow-400 font-bold text-sm">
              {(item.price * quantity).toLocaleString("vi-VN")} đ
            </span>
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden sm:block">
        <div className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-slate-700/30 transition-colors">
          {/* Checkbox */}
          <div className="col-span-1">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onSelectItem(itemName)}
              className="w-4 h-4 text-yellow-400 bg-slate-600 border-slate-500 rounded focus:ring-yellow-400 focus:ring-2"
            />
          </div>

          {/* Product Info */}
          <div className="col-span-4 flex items-center gap-3">
            <div className="relative">
              <img
                src={url + "/images/" + item.image || "/placeholder.svg"}
                alt={itemName}
                className="w-16 h-16 object-cover rounded-xl border border-slate-600"
              />
              <div className="absolute -top-1 -right-1 bg-yellow-400 text-slate-900 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {quantity}
              </div>
            </div>
            <div>
              <h3 className="font-medium text-white line-clamp-2">{itemName}</h3>
            </div>
          </div>

          {/* Price */}
          <div className="col-span-2 text-gray-300">
            {item.price.toLocaleString("vi-VN")} đ
          </div>

          {/* Quantity Controls */}
          <div className="col-span-2">
            <div className="flex items-center bg-slate-700/50 rounded-xl p-1 w-fit">
              <button
                onClick={() => onRemoveFromCart(itemName)}
                className="w-8 h-8 rounded-lg bg-slate-600 hover:bg-yellow-400 hover:text-slate-900 text-white flex items-center justify-center transition-all duration-200"
                aria-label="Giảm số lượng"
              >
                <Minus size={16} />
              </button>
              <span className="mx-3 text-white min-w-[30px] text-center font-medium">
                {quantity}
              </span>
              <button
                onClick={() => onAddToCart(itemName, 1)}
                className="w-8 h-8 rounded-lg bg-slate-600 hover:bg-yellow-400 hover:text-slate-900 text-white flex items-center justify-center transition-all duration-200"
                aria-label="Tăng số lượng"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* Total Price */}
          <div className="col-span-2 text-yellow-400 font-bold">
            {(item.price * quantity).toLocaleString("vi-VN")} đ
          </div>

          {/* Delete Button */}
          <div className="col-span-1">
            <button
              onClick={() => onRemoveFromCartAll(itemName)}
              className="text-red-400 hover:text-red-300 transition-colors p-2 hover:bg-red-500/10 rounded-lg"
              aria-label="Xóa sản phẩm"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default CartItemRow
