"use client"
import OrderItem from "./OrderItem"

const OrderItemsList = ({ items, cartItems, selectedCartItems, buyNowMode, singleProduct, food_list, url }) => {
  return (
    <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
      {buyNowMode && singleProduct ? (
        // Hiển thị chỉ sản phẩm được mua ngay
        <OrderItem item={singleProduct} quantity={singleProduct.quantity} url={url} />
      ) : (
        // Hiển thị chỉ sản phẩm đã chọn trong giỏ hàng
        food_list.map((item, index) => {
          if (cartItems[item.name] > 0 && selectedCartItems[item.name]) {
            return <OrderItem key={index} item={item} quantity={cartItems[item.name]} url={url} />
          }
          return null
        })
      )}
    </div>
  )
}

export default OrderItemsList
