"use client"

import { useState, useEffect } from "react"
import { Truck, MapPin, Clock, DollarSign, AlertCircle, CheckCircle, Loader2 } from "lucide-react"
import axios from "axios"

const ShippingCalculator = ({ selectedAddress, onShippingCalculated, className = "" }) => {
  const [isCalculating, setIsCalculating] = useState(false)
  const [shippingInfo, setShippingInfo] = useState(null)
  const [error, setError] = useState("")

  const url = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000"

  // Auto calculate when address changes
  useEffect(() => {
    if (selectedAddress && selectedAddress.trim().length > 10) {
      calculateShipping(selectedAddress)
    } else {
      // Reset shipping info if address is cleared or too short
      setShippingInfo(null)
      setError("")
      onShippingCalculated?.(null)
    }
  }, [selectedAddress])

  const calculateShipping = async (address) => {
    if (!address || address.trim().length < 10) {
      setError("Địa chỉ quá ngắn, vui lòng nhập chi tiết hơn")
      return
    }

    setIsCalculating(true)
    setError("")
    setShippingInfo(null)

    try {
      console.log("Calculating shipping for address:", address)

      const response = await axios.post(
        `${url}/api/shipping/calculate`,
        {
          destination: address.trim(),
        },
        {
          timeout: 15000,
          headers: {
            "Content-Type": "application/json",
          },
        },
      )

      console.log("Shipping calculation response:", response.data)

      if (response.data.success) {
        const shipping = response.data.data
        setShippingInfo(shipping)
        onShippingCalculated?.(shipping)
      } else {
        setError(response.data.message || "Không thể tính phí vận chuyển")
        onShippingCalculated?.(null)
      }
    } catch (error) {
      console.error("Shipping calculation error:", error)

      let errorMessage = "Không thể tính phí vận chuyển"

      if (error.code === "ECONNABORTED" || error.message.includes("timeout")) {
        errorMessage = "Kết nối mạng chậm, vui lòng thử lại"
      } else if (error.response) {
        errorMessage = error.response.data?.message || "Lỗi từ máy chủ"
      } else if (error.request) {
        errorMessage = "Không thể kết nối đến máy chủ"
      }

      setError(errorMessage)
      onShippingCalculated?.(null)
    } finally {
      setIsCalculating(false)
    }
  }

  const handleRetry = () => {
    if (selectedAddress) {
      calculateShipping(selectedAddress)
    }
  }

  return (
    <div className={`bg-slate-700/30 rounded-xl p-4 border border-slate-600 mb-6 ${className}`}>
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
        <Truck className="mr-2 text-yellow-400" size={20} />
        Phí vận chuyển
      </h3>

      {/* Loading State */}
      {isCalculating && (
        <div className="flex items-center justify-center py-6">
          <Loader2 className="animate-spin text-yellow-400 mr-2" size={20} />
          <span className="text-gray-300">Đang tính phí vận chuyển...</span>
        </div>
      )}

      {/* Error State */}
      {error && !isCalculating && (
        <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 mb-4">
          <div className="flex items-start">
            <AlertCircle className="text-red-400 mr-2 mt-0.5 flex-shrink-0" size={16} />
            <div className="flex-1">
              <p className="text-red-300 text-sm">{error}</p>
              {selectedAddress && (
                <button onClick={handleRetry} className="text-red-400 hover:text-red-300 text-sm underline mt-1">
                  Thử lại
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Success State */}
      {shippingInfo && !isCalculating && (
        <div className="space-y-3">
          <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3">
            <div className="flex items-center">
              <CheckCircle className="text-green-400 mr-2" size={16} />
              <span className="text-green-300 text-sm font-medium">
                {shippingInfo.freeShipping
                  ? "Miễn phí vận chuyển cho đơn hàng trong bán kính 2km"
                  : "Đã tính phí vận chuyển"}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-800/50 rounded-lg p-3">
              <div className="flex items-center text-gray-400 text-xs mb-1">
                <MapPin size={12} className="mr-1" />
                Khoảng cách
              </div>
              <div className="text-white font-semibold">{shippingInfo.distance}km</div>
            </div>

            <div className="bg-slate-800/50 rounded-lg p-3">
              <div className="flex items-center text-gray-400 text-xs mb-1">
                <DollarSign size={12} className="mr-1" />
                Phí ship
              </div>
              <div className="text-white font-semibold">
                {shippingInfo.freeShipping ? "Miễn phí" : `${shippingInfo.shippingFee.toLocaleString("vi-VN")}đ`}
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-lg p-3">
            <div className="flex items-center text-gray-400 text-xs mb-1">
              <Clock size={12} className="mr-1" />
              Thời gian giao hàng
            </div>
            <div className="text-white font-semibold">{shippingInfo.duration}</div>
          </div>

          {/* {shippingInfo.geocodingSource && (
            <div className="text-xs text-gray-500">
              Nguồn: {shippingInfo.geocodingSource} • {shippingInfo.routingSource}
            </div>
          )} */}
        </div>
      )}

      {/* Default Info */}
      {!selectedAddress && !isCalculating && !error && (
        <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
          <div className="space-y-2 text-sm">
            <div className="flex items-center text-green-400">
              <CheckCircle size={16} className="mr-2" />
              <span>Miễn phí vận chuyển cho đơn hàng trong bán kính 2km</span>
            </div>

            <div className="flex items-center text-blue-300">
              <DollarSign size={16} className="mr-2" />
              <span>2-5km: 14.000đ, 5-7km: 20.000đ, 7-10km: 25.000đ</span>
            </div>

            <div className="flex items-center text-red-400">
              <AlertCircle size={16} className="mr-2" />
              <span>Không giao hàng cho địa chỉ cách xa hơn 10km</span>
            </div>

            <div className="flex items-center text-yellow-400">
              <Clock size={16} className="mr-2" />
              <span>Thời gian giao hàng: 15-30 phút tùy khoảng cách</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ShippingCalculator
