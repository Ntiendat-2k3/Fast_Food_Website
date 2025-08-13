"use client"
import { AlertCircle, Phone, User } from "lucide-react"
import AddressAutocomplete from "./AddressAutocomplete"

const AddressForm = ({
  data = { name: "", street: "", phone: "" },
  errors = {},
  onChangeHandler,
  onSubmit,
  mode = "add",
  onCancel,
  onAddressSelect,
}) => {
  const handleAddressChange = (address) => {
    onChangeHandler({
      target: {
        name: "street",
        value: address,
      },
    })
  }

  const handleAddressSelect = (addressData) => {
    // Update form data with selected address
    onChangeHandler({
      target: {
        name: "street",
        value: addressData.description,
      },
    })

    // Notify parent component about address selection
    onAddressSelect?.(addressData)
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="relative">
        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          className={`w-full bg-slate-700/50 text-white border ${
            errors.name ? "border-red-500" : "border-slate-600"
          } rounded-xl py-3 pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent`}
          required
          name="name"
          onChange={onChangeHandler}
          value={data.name || ""}
          type="text"
          placeholder="Họ tên người nhận"
        />
        {errors.name && (
          <div className="text-red-400 text-sm mt-1 flex items-center">
            <AlertCircle size={14} className="mr-1" />
            {errors.name}
          </div>
        )}
      </div>

      <div className="relative">
        <AddressAutocomplete
          value={data.street || ""}
          onChange={handleAddressChange}
          onSelect={handleAddressSelect}
          placeholder="Nhập địa chỉ giao hàng chi tiết..."
          className="w-full"
        />
        {errors.street && (
          <div className="text-red-400 text-sm mt-1 flex items-center">
            <AlertCircle size={14} className="mr-1" />
            {errors.street}
          </div>
        )}
      </div>

      <div className="relative">
        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          className={`w-full bg-slate-700/50 text-white border ${
            errors.phone ? "border-red-500" : "border-slate-600"
          } rounded-xl py-3 pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent`}
          required
          name="phone"
          onChange={onChangeHandler}
          value={data.phone || ""}
          type="text"
          placeholder="Số điện thoại liên hệ (VD: 0912345678)"
        />
        {errors.phone && (
          <div className="text-red-400 text-sm mt-1 flex items-center">
            <AlertCircle size={14} className="mr-1" />
            {errors.phone}
          </div>
        )}
      </div>

      {onCancel && (
        <div className="flex space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-slate-600 hover:bg-slate-500 text-white py-2 px-4 rounded-xl transition-all duration-300"
          >
            Hủy
          </button>
          <button
            type="submit"
            className="flex-1 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-slate-900 py-2 px-4 rounded-xl transition-all duration-300 font-medium"
          >
            {mode === "add" ? "Thêm địa chỉ" : "Cập nhật"}
          </button>
        </div>
      )}
    </form>
  )
}

export default AddressForm
