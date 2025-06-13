import { Package } from "lucide-react"

const EmptyOrderState = () => {
  return (
    <div className="text-center py-12 bg-gray-50 dark:bg-dark-lighter md:rounded-xl">
      <Package size={64} className="mx-auto mb-4 text-gray-400" />
      <h3 className="text-xl text-gray-500 dark:text-gray-400 mb-2">Không có đơn hàng nào</h3>
      <p className="text-gray-400 dark:text-gray-500">Chưa có đơn hàng nào phù hợp với tìm kiếm của bạn</p>
    </div>
  )
}

export default EmptyOrderState
