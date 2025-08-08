"use client"
import CartItemRow from "./CartItemRow"

const CartTable = ({
  cartItems,
  food_list,
  url,
  selectedItems,
  selectAll,
  onSelectAll,
  onSelectItem,
  onAddToCart,
  onRemoveFromCart,
  onRemoveFromCartAll,
}) => {
  const renderCartItems = () => {
    if (!cartItems || Object.keys(cartItems).length === 0) {
      return null
    }

    return Object.keys(cartItems).map((itemName, index) => {
      if (cartItems[itemName] <= 0) return null

      const item = food_list.find((product) => product.name === itemName)
      if (!item) {
        console.log(`Item not found in food_list: ${itemName}`)
        return null
      }

      return (
        <CartItemRow
          key={itemName}
          itemName={itemName}
          item={item}
          quantity={cartItems[itemName]}
          index={index}
          isSelected={selectedItems[itemName] || false}
          url={url}
          onSelectItem={onSelectItem}
          onAddToCart={onAddToCart}
          onRemoveFromCart={onRemoveFromCart}
          onRemoveFromCartAll={onRemoveFromCartAll}
        />
      )
    })
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Mobile Select All */}
      <div className="flex items-center justify-between bg-slate-700/30 p-3 rounded-lg sm:hidden">
        <span className="text-sm font-medium text-white">Chọn tất cả</span>
        <input
          type="checkbox"
          checked={selectAll}
          onChange={onSelectAll}
          className="w-4 h-4 text-yellow-400 bg-slate-600 border-slate-500 rounded focus:ring-yellow-400 focus:ring-2"
        />
      </div>

      {/* Desktop Table Header */}
      <div className="hidden sm:block">
        <div className="grid grid-cols-12 gap-4 p-4 bg-slate-700/30 rounded-lg font-medium text-gray-300 text-sm">
          <div className="col-span-1 flex items-center">
            <input
              type="checkbox"
              checked={selectAll}
              onChange={onSelectAll}
              className="w-4 h-4 text-yellow-400 bg-slate-600 border-slate-500 rounded focus:ring-yellow-400 focus:ring-2"
            />
          </div>
          <div className="col-span-4">Sản phẩm</div>
          <div className="col-span-2">Giá</div>
          <div className="col-span-2">Số lượng</div>
          <div className="col-span-2">Tổng tiền</div>
          <div className="col-span-1">Xóa</div>
        </div>
      </div>

      {/* Cart Items */}
      <div className="space-y-3 sm:space-y-2">
        {renderCartItems()}
      </div>
    </div>
  )
}

export default CartTable
