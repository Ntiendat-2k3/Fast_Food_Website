"use client"
import { Edit, Trash2, Check } from "lucide-react"

const ProductCard = ({
  item,
  url,
  deleteMode,
  selectedItems,
  toggleSelectItem,
  handleEditClick,
  handleDeleteClick,
}) => {
  return (
    <div
      onClick={() => deleteMode && toggleSelectItem(item._id)}
      className={`bg-white dark:bg-dark rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all border ${
        deleteMode && selectedItems.includes(item._id)
          ? "border-primary ring-2 ring-primary/20"
          : "border-gray-100 dark:border-dark-lighter"
      } ${deleteMode ? "cursor-pointer" : ""}`}
    >
      <div className="h-32 sm:h-40 md:h-48 overflow-hidden relative">
        {/* Overlay khi chọn trong chế độ xóa */}
        {deleteMode && (
          <div
            className={`absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center z-10 transition-opacity ${
              selectedItems.includes(item._id) ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
              <Check size={16} className="text-white" />
            </div>
          </div>
        )}
        <img
          src={`${url}/images/${item.image}`}
          alt={item.name}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
      </div>
      <div className="p-2 sm:p-3 md:p-4">
        <h3 className="font-bold text-gray-800 dark:text-white text-sm md:text-lg mb-1 line-clamp-1">{item.name}</h3>
        <div className="flex items-center mb-2">
          <span className="bg-primary-light text-dark text-xs px-2 py-0.5 rounded-full">{item.category}</span>
        </div>
        <p className="text-gray-600 dark:text-gray-300 text-xs md:text-sm mb-2 md:mb-3 line-clamp-2">
          {item.description}
        </p>
        <div className="flex justify-between items-center">
          <span className="text-sm md:text-lg font-bold text-primary">{item.price.toLocaleString("vi-VN")} đ</span>
          {!deleteMode && (
            <div className="flex space-x-1">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleEditClick(item)
                }}
                className="p-1 md:p-2 bg-blue-100 text-blue-500 rounded-full hover:bg-blue-200 transition-colors"
                title="Sửa sản phẩm"
              >
                <Edit size={14} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleDeleteClick(item._id)
                }}
                className="p-1 md:p-2 bg-red-100 text-red-500 rounded-full hover:bg-red-200 transition-colors"
                title="Xóa sản phẩm"
              >
                <Trash2 size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProductCard
