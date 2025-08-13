"use client"
import { useState } from "react"
import { Trash2, Plus, Minus } from "lucide-react"
import ImageWithFallback from "../ui/ImageWithFallback"
import PriceDisplay from "../ui/PriceDisplay"

const CartItemRow = ({
  itemId,
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
  const [isUpdating, setIsUpdating] = useState(false)

  const handleAddToCart = async () => {
    setIsUpdating(true)
    try {
      await onAddToCart(itemId, 1)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleRemoveFromCart = async () => {
    setIsUpdating(true)
    try {
      await onRemoveFromCart(itemId)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleRemoveAll = async () => {
    setIsUpdating(true)
    try {
      await onRemoveFromCartAll(itemId)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleSelectItem = () => {
    onSelectItem(itemId)
  }

  const totalPrice = item.price * quantity

  return (
    <>
      {/* Mobile Layout */}
      <div className="block sm:hidden bg-slate-700/20 rounded-lg p-4 border border-slate-600/30">
        <div className="flex items-start space-x-3">
          {/* Checkbox */}
          <input
            type="checkbox"
            checked={isSelected}
            onChange={handleSelectItem}
            className="w-4 h-4 text-yellow-400 bg-slate-600 border-slate-500 rounded focus:ring-yellow-400 focus:ring-2 mt-1"
          />

          {/* Product Image */}
          <div className="flex-shrink-0">
            <ImageWithFallback
              src={`${url}/images/${item.image}`}
              alt={item.name}
              className="w-16 h-16 object-cover rounded-lg"
              fallbackSrc="/diverse-food-spread.png"
            />
          </div>

          {/* Product Info */}
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-medium text-sm mb-1 line-clamp-2">{item.name}</h3>
            <div className="flex items-center justify-between mb-2">
              <PriceDisplay price={item.price} className="text-yellow-400 text-sm font-semibold" />
              <PriceDisplay price={totalPrice} className="text-white text-sm font-semibold" />
            </div>

            {/* Quantity Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleRemoveFromCart}
                  disabled={isUpdating}
                  className="w-8 h-8 rounded-full bg-slate-600 hover:bg-slate-500 flex items-center justify-center transition-colors disabled:opacity-50"
                >
                  <Minus className="w-4 h-4 text-white" />
                </button>
                <span className="text-white font-medium min-w-[2rem] text-center">{quantity}</span>
                <button
                  onClick={handleAddToCart}
                  disabled={isUpdating}
                  className="w-8 h-8 rounded-full bg-yellow-500 hover:bg-yellow-400 flex items-center justify-center transition-colors disabled:opacity-50"
                >
                  <Plus className="w-4 h-4 text-slate-900" />
                </button>
              </div>

              {/* Delete Button */}
              <button
                onClick={handleRemoveAll}
                disabled={isUpdating}
                className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden sm:grid grid-cols-12 gap-4 p-4 bg-slate-700/20 rounded-lg border border-slate-600/30 items-center hover:bg-slate-700/30 transition-colors">
        {/* Checkbox */}
        <div className="col-span-1 flex items-center">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={handleSelectItem}
            className="w-4 h-4 text-yellow-400 bg-slate-600 border-slate-500 rounded focus:ring-yellow-400 focus:ring-2"
          />
        </div>

        {/* Product Info */}
        <div className="col-span-4 flex items-center space-x-3">
          <ImageWithFallback
            src={`${url}/images/${item.image}`}
            alt={item.name}
            className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
            fallbackSrc="/diverse-food-spread.png"
          />
          <div className="min-w-0 flex-1">
            <h3 className="text-white font-medium text-sm mb-1 line-clamp-2">{item.name}</h3>
            <p className="text-gray-400 text-xs line-clamp-1">{item.category}</p>
          </div>
        </div>

        {/* Price */}
        <div className="col-span-2">
          <PriceDisplay price={item.price} className="text-yellow-400 font-semibold" />
        </div>

        {/* Quantity Controls */}
        <div className="col-span-2">
          <div className="flex items-center space-x-2">
            <button
              onClick={handleRemoveFromCart}
              disabled={isUpdating}
              className="w-8 h-8 rounded-full bg-slate-600 hover:bg-slate-500 flex items-center justify-center transition-colors disabled:opacity-50"
            >
              <Minus className="w-4 h-4 text-white" />
            </button>
            <span className="text-white font-medium min-w-[2rem] text-center">{quantity}</span>
            <button
              onClick={handleAddToCart}
              disabled={isUpdating}
              className="w-8 h-8 rounded-full bg-yellow-500 hover:bg-yellow-400 flex items-center justify-center transition-colors disabled:opacity-50"
            >
              <Plus className="w-4 h-4 text-slate-900" />
            </button>
          </div>
        </div>

        {/* Total Price */}
        <div className="col-span-2">
          <PriceDisplay price={totalPrice} className="text-white font-semibold" />
        </div>

        {/* Delete Button */}
        <div className="col-span-1 flex justify-center">
          <button
            onClick={handleRemoveAll}
            disabled={isUpdating}
            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </>
  )
}

export default CartItemRow
