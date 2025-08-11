"use client"

import { useState, useCallback } from "react"
import { Truck, MapPin, Clock, DollarSign, AlertCircle, CheckCircle, Info, RefreshCw } from "lucide-react"
import axios from "axios"
import AddressAutocomplete from "./AddressAutocomplete"

const ShippingCalculator = ({ onShippingCalculated, className = "" }) => {
  const [address, setAddress] = useState("")
  const [isCalculating, setIsCalculating] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState("")
  const [showDetails, setShowDetails] = useState(false)

  const url = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000"

  // Delivery zones for reference
  const deliveryZones = [
    { range: "< 2km", fee: 0, color: "text-green-600", bgColor: "bg-green-50", icon: "🎉" },
    { range: "2-5km", fee: 14000, color: "text-blue-600", bgColor: "bg-blue-50", icon: "🚚" },
    { range: "5-7km", fee: 20000, color: "text-yellow-600", bgColor: "bg-yellow-50", icon: "🚛" },
    { range: "7-10km", fee: 25000, color: "text-red-600", bgColor: "bg-red-50", icon: "🚐" },
  ]

  // Calculate shipping fee
  const calculateShipping = useCallback(
    async (destinationAddress) => {
      if (!destinationAddress || destinationAddress.trim().length < 5) {
        setError("Vui lòng nhập địa chỉ chi tiết (ít nhất 5 ký tự)")
        return
      }

      setIsCalculating(true)
      setError("")
      setResult(null)

      try {
        console.log(`Calculating shipping for: "${destinationAddress}"`)

        const response = await axios.post(
          `${url}/api/shipping/calculate-distance`,
          { destination: destinationAddress.trim() },
          { timeout: 30000 },
        )

        if (response.data.success) {
          const shippingData = response.data.data
          setResult(shippingData)
          setShowDetails(true)
          onShippingCalculated?.(shippingData)
          console.log("Shipping calculation successful:", shippingData)
        } else {
          const errorMsg = response.data.message || "Không thể tính phí vận chuyển"
          setError(errorMsg)

          // Show validation errors if available
          if (response.data.errors && response.data.errors.length > 0) {
            setError(`${errorMsg}: ${response.data.errors.join(", ")}`)
          }
        }
      } catch (err) {
        console.error("Shipping calculation error:", err)

        let errorMessage = "Không thể tính phí vận chuyển"

        if (err.code === "ECONNABORTED") {
          errorMessage = "Kết nối mạng chậm, vui lòng thử lại"
        } else if (err.response?.status === 400) {
          errorMessage = err.response.data?.message || "Địa chỉ không hợp lệ hoặc ngoài phạm vi giao hàng"
        } else if (err.response?.status === 500) {
          errorMessage = "Lỗi server, vui lòng thử lại sau"
        } else if (err.message.includes("Network Error")) {
          errorMessage = "Lỗi kết nối mạng, vui lòng kiểm tra internet"
        }

        setError(errorMessage)
      } finally {
        setIsCalculating(false)
      }
    },
    [url, onShippingCalculated],
  )

  // Handle address selection from autocomplete
  const handleAddressSelect = (suggestion) => {
    setAddress(suggestion.description)
    calculateShipping(suggestion.description)
  }

  // Handle manual calculation
  const handleCalculate = () => {
    calculateShipping(address)
  }

  // Reset calculation
  const handleReset = () => {
    setAddress("")
    setResult(null)
    setError("")
    setShowDetails(false)
    onShippingCalculated?.(null)
  }

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount)
  }

  // Get distance color
  const getDistanceColor = (distance) => {
    if (distance <= 2) return "text-green-600"
    if (distance <= 5) return "text-blue-600"
    if (distance <= 7) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <div className={`bg-white rounded-xl border border-gray-200 shadow-sm p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Truck className="text-blue-600" size={24} />
          </div>
          Tính phí vận chuyển
        </h3>

        {result && (
          <button
            onClick={handleReset}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            <RefreshCw size={16} />
            Tính lại
          </button>
        )}
      </div>

      {/* Info Banner */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-3">
          <Info className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
          <div className="text-blue-800">
            <p className="font-medium text-sm">Hướng dẫn nhập địa chỉ:</p>
            <ul className="text-xs mt-2 space-y-1">
              <li>• Nhập tên trường học, công ty, bệnh viện để có kết quả chính xác nhất</li>
              <li>• Hoặc nhập địa chỉ chi tiết: số nhà, tên đường, quận/huyện, thành phố</li>
              <li>• Ví dụ: "Đại học Đại Nam" hoặc "123 Nguyễn Trãi, Thanh Xuân, Hà Nội"</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Address Input */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Địa chỉ giao hàng <span className="text-red-500">*</span>
        </label>
        <AddressAutocomplete
          value={address}
          onChange={setAddress}
          onSelect={handleAddressSelect}
          placeholder="Nhập tên trường, công ty hoặc địa chỉ chi tiết..."
          disabled={isCalculating}
        />
      </div>

      {/* Calculate Button */}
      {address && !result && (
        <button
          onClick={handleCalculate}
          disabled={isCalculating || address.length < 5}
          className={`
            w-full py-4 px-6 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-3
            ${
              isCalculating || address.length < 5
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            }
          `}
        >
          {isCalculating ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
              Đang tính toán phí vận chuyển...
            </>
          ) : (
            <>
              <DollarSign size={20} />
              Tính phí vận chuyển
            </>
          )}
        </button>
      )}

      {/* Error Message */}
      {error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <p className="text-sm font-semibold text-red-800">Không thể tính phí vận chuyển</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
              <div className="mt-3">
                <button onClick={() => setError("")} className="text-xs text-red-600 hover:text-red-800 underline">
                  Đóng thông báo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="mt-6 space-y-4">
          {/* Main Result Card */}
          <div
            className={`p-6 rounded-xl border-2 ${
              result.freeShipping
                ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200"
                : "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  {result.freeShipping ? (
                    <CheckCircle className="text-green-600" size={32} />
                  ) : (
                    <DollarSign className="text-blue-600" size={32} />
                  )}
                  <div>
                    <p className="text-sm text-gray-600">Phí vận chuyển</p>
                    <p className={`text-3xl font-bold ${result.freeShipping ? "text-green-600" : "text-blue-600"}`}>
                      {result.freeShipping ? "MIỄN PHÍ" : formatCurrency(result.shippingFee)}
                    </p>
                  </div>
                </div>

                {result.freeShipping && (
                  <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full">
                    🎉 Chúc mừng! Bạn được miễn phí vận chuyển
                  </div>
                )}
              </div>

              <div className="text-right">
                <div className="text-6xl">{result.freeShipping ? "🎉" : "🚚"}</div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <MapPin className="text-gray-500" size={16} />
                <div>
                  <p className="text-xs text-gray-500">Khoảng cách</p>
                  <p className={`font-semibold ${getDistanceColor(result.distance)}`}>{result.distance}km</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="text-gray-500" size={16} />
                <div>
                  <p className="text-xs text-gray-500">Thời gian giao hàng</p>
                  <p className="font-semibold text-gray-900">{result.duration}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Details Toggle */}
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="w-full flex items-center justify-center gap-2 py-3 text-sm text-gray-600 hover:text-gray-800 transition-colors border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <span>Chi tiết vận chuyển</span>
            <svg
              className={`w-4 h-4 transition-transform ${showDetails ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Expanded Details */}
          {showDetails && (
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-1 gap-4 text-sm">
                <div>
                  <p className="text-gray-600 font-medium">Điểm xuất phát:</p>
                  <p className="text-gray-900 mt-1">{result.originAddress}</p>
                </div>

                <div>
                  <p className="text-gray-600 font-medium">Điểm đến:</p>
                  <p className="text-gray-900 mt-1">{result.destinationAddress}</p>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Độ chính xác địa chỉ:</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            result.confidence > 0.8
                              ? "bg-green-500"
                              : result.confidence > 0.6
                                ? "bg-yellow-500"
                                : "bg-red-500"
                          }`}
                          style={{ width: `${result.confidence * 100}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium">{Math.round(result.confidence * 100)}%</span>
                    </div>
                  </div>

                  <div>
                    <p className="text-gray-600">Nguồn dữ liệu:</p>
                    <p className="text-gray-900 font-medium text-xs">
                      {result.geocodingSource} + {result.routingSource}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Delivery Zones Table */}
      {!result && (
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin className="text-blue-600" size={20} />
            Bảng phí vận chuyển
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {deliveryZones.map((zone, index) => (
              <div key={index} className={`flex items-center justify-between p-4 rounded-lg ${zone.bgColor} border`}>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{zone.icon}</span>
                  <div>
                    <span className="font-semibold text-gray-900">{zone.range}</span>
                    <p className="text-xs text-gray-600">Khoảng cách</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-lg font-bold ${zone.color}`}>
                    {zone.fee === 0 ? "Miễn phí" : formatCurrency(zone.fee)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="text-red-600" size={16} />
              <p className="text-sm text-red-800 font-medium">
                ⚠️ Không giao hàng cho địa chỉ cách xa hơn 10km từ cửa hàng
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ShippingCalculator
