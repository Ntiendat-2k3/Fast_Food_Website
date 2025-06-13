"use client"
import { Edit, Home, Star, Trash2 } from "lucide-react"

const AddressCard = ({ address, isSelected, onSelect, onEdit, onDelete, onSetDefault, showActions = true }) => {
  return (
    <div
      onClick={() => onSelect(address)}
      className={`border ${
        isSelected ? "border-yellow-400 bg-yellow-400/10" : "border-slate-600 bg-slate-700/30"
      } rounded-xl p-4 cursor-pointer hover:border-yellow-400/50 transition-all duration-300`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start">
          <div
            className={`mt-1 w-5 h-5 rounded-full border-2 ${
              isSelected ? "border-yellow-400" : "border-gray-400"
            } flex items-center justify-center mr-3 flex-shrink-0`}
          >
            {isSelected && <div className="w-3 h-3 rounded-full bg-yellow-400"></div>}
          </div>
          <div>
            <div className="flex items-center">
              <span className="text-white font-medium">{address.name}</span>
              {address.isDefault && (
                <span className="ml-2 text-xs bg-green-500/20 text-green-400 py-0.5 px-2 rounded-full flex items-center">
                  <Home size={10} className="mr-1" />
                  Mặc định
                </span>
              )}
            </div>
            <p className="text-gray-300 text-sm mt-1">{address.phone}</p>
            <p className="text-gray-400 text-sm mt-1">{address.street}</p>
          </div>
        </div>

        {showActions && (
          <div className="flex space-x-2">
            <button
              onClick={(e) => {
                e.stopPropagation()
                onEdit(address)
              }}
              className="text-blue-400 hover:text-blue-300 transition-colors p-1"
            >
              <Edit size={16} />
            </button>
            {!address.isDefault && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onSetDefault(address._id)
                  }}
                  className="text-yellow-400 hover:text-yellow-300 transition-colors p-1"
                  title="Đặt làm mặc định"
                >
                  <Star size={16} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete(address._id)
                  }}
                  className="text-red-400 hover:text-red-300 transition-colors p-1"
                >
                  <Trash2 size={16} />
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default AddressCard
