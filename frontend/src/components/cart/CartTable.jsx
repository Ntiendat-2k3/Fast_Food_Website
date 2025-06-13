"use client"
import CartTableHeader from "./CartTableHeader"
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
    <div className="overflow-x-auto -mx-6 px-6">
      <table className="min-w-full">
        <CartTableHeader selectAll={selectAll} onSelectAll={onSelectAll} />
        <tbody>{renderCartItems()}</tbody>
      </table>
    </div>
  )
}

export default CartTable
