"use client"

import { useState, useEffect } from "react"
import { Truck, MapPin, Clock, DollarSign, AlertCircle, CheckCircle, Info, Navigation, Shield } from "lucide-react"
import axios from "axios"

const ShippingCalculator = ({ selectedAddress, onShippingUpdate }) => {
  const [shippingInfo, setShippingInfo] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [validationErrors, setValidationErrors] = useState([])

  const url = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000"

  // Auto calculate when address changes
  useEffect(() => {
    if (selectedAddress && selectedAddress.trim().length > 10) {
      calculateShipping()
    }
  }, [selectedAddress])

  const calculateShipping = async () => {
    if (!selectedAddress) {
      setError("Vui lòng chọn địa chỉ giao hàng")
      return
    }

    setLoading(true)
    setError("")
    setValidationErrors([])

    try {
      const response = await axios.post(`${url}/api/shipping/calculate-distance`, {
        destination: selectedAddress,
      })

      if (response.data.success) {
        setShippingInfo(response.data.data)
        onShippingUpdate?.(response.data.data)
      } else {
        setError(response.data.message)
        if (response.data.errors) {
          setValidationErrors(response.data.errors)
        }
        setShippingInfo(null)
        onShippingUpdate?.(null)
      }
    } catch (error) {
      console.error("Error calculating shipping:", error)
      if (error.response?.data?.message) {
        setError(error.response.data.message)
      } else if (error.code === "ECONNABORTED") {
        setError("Timeout: Không thể kết nối đến dịch vụ tính phí ship. Vui lòng thử lại.")
      } else {
        setError("Không thể tính phí vận chuyển. Vui lòng kiểm tra kết nối mạng và thử lại.")
      }
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

  const getConfidenceText = (confidence) => {
    if (confidence >= 0.8) return "Rất chính xác"
    if (confidence >= 0.6) return "Chính xác"
    if (confidence >= 0.4) return "Khá chính xác"
    return "Ước tính"
  }

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return "text-green-400"
    if (confidence >= 0.6) return "text-yellow-400"
    if (confidence >= 0.4) return "text-orange-400"
    return "text-red-400"
  }

  return (
    <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600 mb-6">
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
            <div className="flex items-center">
              <Navigation className="mr-2" size={16} />
              Tính phí ship
            </div>
          )}
        </button>
      </div>

      {/* Info notice */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 mb-4">
        <div className="flex items-start">
          <Info className="text-blue-400 mr-2 mt-0.5 flex-shrink-0" size={16} />
          <div className="text-blue-300 text-sm">
            <p className="font-medium mb-1">Phí vận chuyển được tính chính xác:</p>
            <ul className="text-xs space-y-1 text-blue-200">
              <li>• Sử dụng OpenStreetMap để xác định tọa độ GPS chính xác</li>
              <li>• Tính khoảng cách đường bộ thực tế (không phải đường chim bay)</li>
              <li>• Thời gian bao gồm: chuẩn bị đơn (15p) + di chuyển + giao hàng</li>
              <li>• Miễn phí ship cho đơn hàng trong bán kính 2km</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="bg-orange-500/20 border border-orange-500/30 rounded-lg p-3 mb-4">
          <div className="flex items-start">
            <AlertCircle className="text-orange-400 mr-2 mt-0.5 flex-shrink-0" size={16} />
            <div>
              <p className="text-orange-300 font-medium text-sm mb-2">Địa chỉ cần được cải thiện:</p>
              <ul className="text-orange-200 text-xs space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
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
          {/* Confidence indicator */}
          {shippingInfo.confidence && (
            <div className="bg-slate-800/30 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Shield className="text-blue-400 mr-2" size={16} />
                  <span className="text-gray-300 text-sm">Độ chính xác:</span>
                </div>
                <span className={`text-sm font-medium ${getConfidenceColor(shippingInfo.confidence)}`}>
                  {getConfidenceText(shippingInfo.confidence)}
                </span>
              </div>
            </div>
          )}

          {/* Route info */}
          {shippingInfo.originAddress && shippingInfo.destinationAddress && (
            <div className="bg-slate-800/30 rounded-lg p-3 text-xs">
              <div className="text-gray-400 mb-2">Tuyến đường:</div>
              <div className="space-y-2">
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-1.5 mr-2 flex-shrink-0"></div>
                  <div className="text-green-300 line-clamp-2">{shippingInfo.originAddress}</div>
                </div>
                <div className="border-l-2 border-dashed border-gray-600 ml-1 h-4"></div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-red-400 rounded-full mt-1.5 mr-2 flex-shrink-0"></div>
                  <div className="text-red-300 line-clamp-2">{shippingInfo.destinationAddress}</div>
                </div>
              </div>
            </div>
          )}

          <div className="bg-slate-800/50 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center">
                <MapPin className="text-blue-400 mr-2" size={16} />
                <div>
                  <div className="text-gray-400 text-xs">Khoảng cách thực tế</div>
                  <div className={`font-semibold ${getDistanceColor(shippingInfo.distance)}`}>
                    {shippingInfo.distance} km
                  </div>
                </div>
              </div>

              <div className="flex items-center">
                <Clock className="text-green-400 mr-2" size={16} />
                <div>
                  <div className="text-gray-400 text-xs">Thời gian giao hàng</div>
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

          {/* Delivery time breakdown */}
          <div className="bg-slate-800/30 rounded-lg p-3">
            <div className="text-gray-400 text-xs mb-2">Thời gian giao hàng bao gồm:</div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-blue-300">
                <span>Chuẩn bị đơn hàng</span>
                <span>15 phút</span>
              </div>
              <div className="flex justify-between text-yellow-300">
                <span>Di chuyển ({shippingInfo.distance}km)</span>
                <span>~{Math.round((shippingInfo.distance / 25) * 60)} phút</span>
              </div>
              <div className="flex justify-between text-green-300">
                <span>Tìm địa chỉ & giao hàng</span>
                <span>5-10 phút</span>
              </div>
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
              <div className="flex justify-between text-gray-500">
                <span>Trên 10km</span>
                <span>Không giao hàng</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ShippingCalculator
