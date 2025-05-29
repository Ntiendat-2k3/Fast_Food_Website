"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { toast } from "react-toastify"
import { X, Tag, Calendar, DollarSign, Percent, Info, Save } from "lucide-react"

const VoucherModal = ({ url, voucher, onClose, onSuccess }) => {
  const initialData = {
    code: "",
    discountType: "percentage",
    discountValue: "",
    minOrderValue: "0",
    maxDiscountAmount: "",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    isActive: true,
    usageLimit: "0",
    description: "",
  }

  const [formData, setFormData] = useState(initialData)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (voucher) {
      setFormData({
        id: voucher._id,
        code: voucher.code,
        discountType: voucher.discountType,
        discountValue: voucher.discountValue.toString(),
        minOrderValue: voucher.minOrderValue.toString(),
        maxDiscountAmount: voucher.maxDiscountAmount ? voucher.maxDiscountAmount.toString() : "",
        startDate: new Date(voucher.startDate).toISOString().split("T")[0],
        endDate: new Date(voucher.endDate).toISOString().split("T")[0],
        isActive: voucher.isActive,
        usageLimit: voucher.usageLimit.toString(),
        description: voucher.description || "",
      })
    }
  }, [voucher])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    })

    // Clear error when field is edited
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      })
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.code.trim()) {
      newErrors.code = "Vui lòng nhập mã giảm giá"
    } else if (formData.code.length < 3) {
      newErrors.code = "Mã giảm giá phải có ít nhất 3 ký tự"
    }

    if (!formData.discountValue) {
      newErrors.discountValue = "Vui lòng nhập giá trị giảm giá"
    } else if (
      formData.discountType === "percentage" &&
      (Number.parseFloat(formData.discountValue) <= 0 || Number.parseFloat(formData.discountValue) > 100)
    ) {
      newErrors.discountValue = "Giá trị phần trăm phải từ 1 đến 100"
    } else if (formData.discountType === "fixed" && Number.parseFloat(formData.discountValue) <= 0) {
      newErrors.discountValue = "Giá trị giảm giá phải lớn hơn 0"
    }

    if (
      formData.discountType === "percentage" &&
      formData.maxDiscountAmount &&
      Number.parseFloat(formData.maxDiscountAmount) <= 0
    ) {
      newErrors.maxDiscountAmount = "Giảm giá tối đa phải lớn hơn 0"
    }

    if (Number.parseFloat(formData.minOrderValue) < 0) {
      newErrors.minOrderValue = "Giá trị đơn hàng tối thiểu không được âm"
    }

    if (Number.parseFloat(formData.usageLimit) < 0) {
      newErrors.usageLimit = "Giới hạn sử dụng không được âm"
    }

    if (!formData.startDate) {
      newErrors.startDate = "Vui lòng chọn ngày bắt đầu"
    }

    if (!formData.endDate) {
      newErrors.endDate = "Vui lòng chọn ngày kết thúc"
    } else if (new Date(formData.endDate) <= new Date(formData.startDate)) {
      newErrors.endDate = "Ngày kết thúc phải sau ngày bắt đầu"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    const dataToSubmit = {
      ...formData,
      discountValue: Number.parseFloat(formData.discountValue),
      minOrderValue: Number.parseFloat(formData.minOrderValue),
      maxDiscountAmount: formData.maxDiscountAmount ? Number.parseFloat(formData.maxDiscountAmount) : undefined,
      usageLimit: Number.parseFloat(formData.usageLimit),
    }

    try {
      const endpoint = voucher ? `${url}/api/voucher/update` : `${url}/api/voucher/add`
      const response = await axios.post(endpoint, dataToSubmit)

      if (response.data.success) {
        toast.success(voucher ? "Cập nhật voucher thành công" : "Thêm voucher thành công")
        onSuccess()
      } else {
        toast.error(response.data.message || "Đã xảy ra lỗi")
      }
    } catch (error) {
      console.error("Error submitting voucher:", error)
      toast.error("Lỗi kết nối đến máy chủ")
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-dark-light rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
              {voucher ? "Sửa mã giảm giá" : "Thêm mã giảm giá mới"}
            </h2>
            <button
              onClick={onClose}
              className="p-2 bg-gray-100 dark:bg-dark-lighter rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Mã giảm giá */}
              <div>
                <label htmlFor="code" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Mã giảm giá
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Tag className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="code"
                    name="code"
                    value={formData.code}
                    onChange={handleChange}
                    placeholder="Nhập mã giảm giá (VD: SUMMER2023)"
                    className={`pl-10 block w-full rounded-lg border ${
                      errors.code ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                    } bg-white dark:bg-dark py-3 px-4 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary`}
                  />
                </div>
                {errors.code && <p className="mt-1 text-sm text-red-500">{errors.code}</p>}
              </div>

              {/* Loại giảm giá */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Loại giảm giá</label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="discountType"
                      value="percentage"
                      checked={formData.discountType === "percentage"}
                      onChange={handleChange}
                      className="h-4 w-4 text-primary border-gray-300 focus:ring-primary"
                    />
                    <span className="ml-2 text-gray-700 dark:text-gray-300">Phần trăm (%)</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="discountType"
                      value="fixed"
                      checked={formData.discountType === "fixed"}
                      onChange={handleChange}
                      className="h-4 w-4 text-primary border-gray-300 focus:ring-primary"
                    />
                    <span className="ml-2 text-gray-700 dark:text-gray-300">Số tiền cố định (VNĐ)</span>
                  </label>
                </div>
              </div>

              {/* Giá trị giảm giá */}
              <div>
                <label
                  htmlFor="discountValue"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Giá trị giảm giá
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    {formData.discountType === "percentage" ? (
                      <Percent className="h-5 w-5 text-gray-400" />
                    ) : (
                      <DollarSign className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                  <input
                    type="number"
                    id="discountValue"
                    name="discountValue"
                    value={formData.discountValue}
                    onChange={handleChange}
                    placeholder={formData.discountType === "percentage" ? "Nhập % giảm giá" : "Nhập số tiền giảm giá"}
                    className={`pl-10 block w-full rounded-lg border ${
                      errors.discountValue ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                    } bg-white dark:bg-dark py-3 px-4 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary`}
                  />
                </div>
                {errors.discountValue && <p className="mt-1 text-sm text-red-500">{errors.discountValue}</p>}
              </div>

              {/* Giảm tối đa (chỉ cho loại phần trăm) */}
              {formData.discountType === "percentage" && (
                <div>
                  <label
                    htmlFor="maxDiscountAmount"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Giảm tối đa (VNĐ)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <DollarSign className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="number"
                      id="maxDiscountAmount"
                      name="maxDiscountAmount"
                      value={formData.maxDiscountAmount}
                      onChange={handleChange}
                      placeholder="Để trống nếu không giới hạn"
                      className={`pl-10 block w-full rounded-lg border ${
                        errors.maxDiscountAmount ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                      } bg-white dark:bg-dark py-3 px-4 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary`}
                    />
                  </div>
                  {errors.maxDiscountAmount && <p className="mt-1 text-sm text-red-500">{errors.maxDiscountAmount}</p>}
                </div>
              )}

              {/* Giá trị đơn hàng tối thiểu */}
              <div>
                <label
                  htmlFor="minOrderValue"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Giá trị đơn hàng tối thiểu (VNĐ)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    id="minOrderValue"
                    name="minOrderValue"
                    value={formData.minOrderValue}
                    onChange={handleChange}
                    placeholder="Nhập 0 nếu không giới hạn"
                    className={`pl-10 block w-full rounded-lg border ${
                      errors.minOrderValue ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                    } bg-white dark:bg-dark py-3 px-4 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary`}
                  />
                </div>
                {errors.minOrderValue && <p className="mt-1 text-sm text-red-500">{errors.minOrderValue}</p>}
              </div>

              {/* Giới hạn sử dụng */}
              <div>
                <label htmlFor="usageLimit" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Giới hạn sử dụng
                </label>
                <input
                  type="number"
                  id="usageLimit"
                  name="usageLimit"
                  value={formData.usageLimit}
                  onChange={handleChange}
                  placeholder="Nhập 0 nếu không giới hạn"
                  className={`block w-full rounded-lg border ${
                    errors.usageLimit ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                  } bg-white dark:bg-dark py-3 px-4 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary`}
                />
                {errors.usageLimit && <p className="mt-1 text-sm text-red-500">{errors.usageLimit}</p>}
              </div>

              {/* Ngày bắt đầu */}
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Ngày bắt đầu
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    className={`pl-10 block w-full rounded-lg border ${
                      errors.startDate ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                    } bg-white dark:bg-dark py-3 px-4 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary`}
                  />
                </div>
                {errors.startDate && <p className="mt-1 text-sm text-red-500">{errors.startDate}</p>}
              </div>

              {/* Ngày kết thúc */}
              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Ngày kết thúc
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="date"
                    id="endDate"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    className={`pl-10 block w-full rounded-lg border ${
                      errors.endDate ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                    } bg-white dark:bg-dark py-3 px-4 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary`}
                  />
                </div>
                {errors.endDate && <p className="mt-1 text-sm text-red-500">{errors.endDate}</p>}
              </div>
            </div>

            {/* Trạng thái */}
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <span className="ml-2 text-gray-700 dark:text-gray-300">Kích hoạt mã giảm giá</span>
              </label>
            </div>

            {/* Mô tả */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Mô tả
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                placeholder="Nhập mô tả cho mã giảm giá (tùy chọn)"
                className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark py-3 px-4 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
              ></textarea>
            </div>

            {/* Thông tin */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 rounded-r-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <Info className="h-5 w-5 text-blue-500" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Mã giảm giá sẽ chỉ hoạt động khi đang kích hoạt, trong thời gian hiệu lực và chưa vượt quá giới hạn
                    sử dụng.
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="bg-gray-100 dark:bg-dark-lighter text-gray-700 dark:text-gray-200 font-medium py-3 px-6 rounded-lg transition-colors hover:bg-gray-200 dark:hover:bg-dark"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="bg-primary hover:bg-primary-light text-dark font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
              >
                <Save className="mr-2" size={20} />
                {voucher ? "Cập nhật" : "Thêm mới"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default VoucherModal
