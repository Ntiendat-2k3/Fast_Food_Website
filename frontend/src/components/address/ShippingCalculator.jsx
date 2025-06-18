"use client"

import { useState } from "react"
import { Truck, MapPin, Clock, DollarSign, AlertCircle, CheckCircle } from "lucide-react"
import axios from "axios"

const ShippingCalculator = ({ selectedAddress, onShippingUpdate }) => {
  const [shippingInfo, setShippingInfo] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const url = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000"

  // Địa chỉ cửa hàng (có thể config trong admin)
  const storeAddress = "Trường Đại học Thăng Long" // Thay bằng địa chỉ thật

  const calculateShipping = async () => {
    if (!selectedAddress) {
      setError("Vui lòng chọn địa chỉ giao hàng")
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await axios.post(`${url}/api/shipping/calculate-distance`, {
        origin: storeAddress,
        destination: selectedAddress,
      })

      if (response.data.success) {
        setShippingInfo(response.data.data)
        onShippingUpdate?.(response.data.data)
      } else {
        setError(response.data.message)
        setShippingInfo(null)
        onShippingUpdate?.(null)
      }
    } catch (error) {
      console.error("Error calculating shipping:", error)
      setError("Không thể tính phí vận chuyển")
      setShippingInfo(null)
      onShippingUpdate?.(null)
    } finally {
      setLoading(false)
    }
  }

  const getShippingText = (fee) => {
    if (fee === 0) return "Miễn phí vận chuyển"
    return `${fee.toLocaleString("vi-VN")}đ`
  }

  const getDistanceColor = (distance) => {
    if (distance <= 2) return "text-green-400"
    if (distance <= 5) return "text-yellow-400"
    if (distance <= 7) return "text-orange-400"
    return "text-red-400"
  }

  return (
    <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <Truck className="mr-2 text-yellow-400" size={20} />
          Phí vận chuyển
        </h3>
        <button
          onClick={calculateShipping}
          disabled={loading || !selectedAddress}
          className="bg-yellow-400 hover:bg-yellow-500 text-slate-900 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-900 mr-2"></div>
              Đang tính...
            </div>
          ) : (
            "Tính phí ship"
          )}
        </button>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 mb-4">
          <div className="flex items-center">
            <AlertCircle className="text-red-400 mr-2" size={16} />
            <span className="text-red-300 text-sm">{error}</span>
          </div>
        </div>
      )}

      {shippingInfo && (
        <div className="space-y-3">
          <div className="bg-slate-800/50 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center">
                <MapPin className="text-blue-400 mr-2" size={16} />
                <div>
                  <div className="text-gray-400 text-xs">Khoảng cách</div>
                  <div className={`font-semibold ${getDistanceColor(shippingInfo.distance)}`}>
                    {shippingInfo.distance.toFixed(1)} km
                  </div>
                </div>
              </div>

              <div className="flex items-center">
                <Clock className="text-green-400 mr-2" size={16} />
                <div>
                  <div className="text-gray-400 text-xs">Thời gian</div>
                  <div className="text-white font-semibold">{shippingInfo.duration}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {shippingInfo.freeShipping ? (
                  <CheckCircle className="text-green-400 mr-2" size={20} />
                ) : (
                  <DollarSign className="text-yellow-400 mr-2" size={20} />
                )}
                <div>
                  <div className="text-gray-300 text-sm">Phí vận chuyển</div>
                  <div
                    className={`font-bold text-lg ${shippingInfo.freeShipping ? "text-green-400" : "text-yellow-400"}`}
                  >
                    {getShippingText(shippingInfo.shippingFee)}
                  </div>
                </div>
              </div>

              {shippingInfo.freeShipping && (
                <div className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-xs font-medium">
                  🎉 FREE SHIP
                </div>
              )}
            </div>
          </div>

          {/* Shipping tiers info */}
          <div className="bg-slate-800/30 rounded-lg p-3">
            <div className="text-gray-400 text-xs mb-2">Bảng phí vận chuyển:</div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-green-400">
                <span>{"< 2km"}</span>
                <span>Miễn phí</span>
              </div>
              <div className="flex justify-between text-yellow-400">
                <span>2-5km</span>
                <span>14,000đ</span>
              </div>
              <div className="flex justify-between text-orange-400">
                <span>5-7km</span>
                <span>20,000đ</span>
              </div>
              <div className="flex justify-between text-red-400">
                <span>7-10km</span>
                <span>25,000đ</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ShippingCalculator
