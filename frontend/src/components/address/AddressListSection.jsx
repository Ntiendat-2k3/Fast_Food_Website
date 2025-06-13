"use client"
import { Plus, RefreshCw } from "lucide-react"
import AddressCard from "./AddressCard"

const AddressListSection = ({
  addresses,
  selectedAddressId,
  onSelectAddress,
  onAddNewAddress,
  onEditAddress,
  onDeleteAddress,
  onSetDefaultAddress,
  isLoading,
}) => {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-white">Địa chỉ đã lưu</h3>
        <button
          onClick={onAddNewAddress}
          className="flex items-center text-sm bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 py-1 px-3 rounded-lg transition-all duration-300"
        >
          <Plus size={16} className="mr-1" />
          Thêm địa chỉ mới
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-4">
          <RefreshCw size={24} className="animate-spin text-yellow-400" />
        </div>
      ) : addresses.length > 0 ? (
        <div className="space-y-3">
          {addresses.map((address) => (
            <AddressCard
              key={address._id}
              address={address}
              isSelected={selectedAddressId === address._id}
              onSelect={onSelectAddress}
              onEdit={onEditAddress}
              onDelete={onDeleteAddress}
              onSetDefault={onSetDefaultAddress}
            />
          ))}
        </div>
      ) : (
        <div className="bg-slate-700/30 border border-slate-600 rounded-xl p-4 text-center">
          <p className="text-gray-400">Bạn chưa có địa chỉ nào được lưu</p>
          <button
            onClick={onAddNewAddress}
            className="mt-2 flex items-center mx-auto text-sm bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 py-1 px-3 rounded-lg transition-all duration-300"
          >
            <Plus size={16} className="mr-1" />
            Thêm địa chỉ mới
          </button>
        </div>
      )}
    </div>
  )
}

export default AddressListSection
