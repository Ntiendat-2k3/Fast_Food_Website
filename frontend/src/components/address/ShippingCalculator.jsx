"use client"

import { useState, useCallback, useEffect } from "react"
import { Truck, MapPin, DollarSign, AlertCircle, RefreshCw } from "lucide-react"
import axios from "axios"

const ShippingCalculator = ({ onShippingCalculated, className = "", selectedAddress }) => {
  const [isCalculating, setIsCalculating] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState("")

  const url = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000"

  // Auto-calculate when selectedAddress changes
  useEffect(() => {
    if (selectedAddress && selectedAddress.trim().length >= 5) {
      calculateShipping(selectedAddress)
    } else {
      setResult(null)
      setError("")
      onShippingCalculated?.(null)
    }
  }, [selectedAddress])

  // Calculate shipping fee
  const calculateShipping = useCallback(
    async (destinationAddress) => {
      setIsCalculating(true)
      setError("")
      setResult(null)

      try {
        const response = await axios.post(
          `${url}/api/shipping/calculate-distance`,
          { destination: destinationAddress.trim() },
          { timeout: 30000 },
        )

        if (response.data.success) {
          const shippingData = response.data.data
          setResult(shippingData)
          onShippingCalculated?.(shippingData)
        } else {
          const errorMsg = response.data.message || "Không thể tính phí vận chuyển"
          setError(errorMsg)
        }
      } catch (err) {
        console.error("Shipping calculation error:", err)
        let errorMessage = "Không thể tính phí vận chuyển"

        if (err.code === "ECONNABORTED") {
          errorMessage = "Kết nối mạng chậm, vui lòng thử lại"
        } else if (err.response?.status === 400) {
          errorMessage = "Địa chỉ không hợp lệ hoặc ngoài phạm vi giao hàng"
        } else if (err.response?.status === 500) {
          errorMessage = "Lỗi server, vui lòng thử lại sau"
        }

        setError(errorMessage)
      } finally {
        setIsCalculating(false)
      }
    },
    [url, onShippingCalculated],
  )

  // Reset calculation
  const handleReset = () => {
    setResult(null)
    setError("")
    onShippingCalculated?.(null)
  }

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount)
  }

  return (
    <div
      className={`bg-[#0f172a] rounded-lg border border-yellow-600 shadow-lg shadow-yellow-900/20 p-4 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-yellow-400 flex items-center gap-2">
          <Truck className="text-yellow-500" size={20} />
          Phí vận chuyển
        </h3>
        {result && (
          <button onClick={handleReset} className="text-yellow-500 hover:text-yellow-300 transition-colors">
            <RefreshCw size={16} />
          </button>
        )}
      </div>

      {/* Loading */}
      {isCalculating && (
        <div className="mb-4 p-3 bg-slate-800 border border-yellow-600/50 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-400"></div>
            <span className="text-yellow-200 text-sm">Đang tính phí vận chuyển...</span>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 bg-red-900/40 border border-red-700 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="text-red-300" size={16} />
            <span className="text-red-100 text-sm">{error}</span>
          </div>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="bg-slate-800 rounded-lg border border-yellow-600/50 p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-700 rounded-lg">
                {result.freeShipping ? (
                  <span className="text-2xl">🎉</span>
                ) : (
                  <DollarSign className="text-yellow-300" size={20} />
                )}
              </div>
              <div>
                <p className="text-sm text-yellow-300">Phí vận chuyển</p>
                <p className={`text-xl font-bold ${result.freeShipping ? "text-green-300" : "text-yellow-100"}`}>
                  {result.freeShipping ? "MIỄN PHÍ" : formatCurrency(result.shippingFee)}
                </p>
              </div>
            </div>

            <div className="text-right">
              <div className="flex items-center gap-1 text-sm text-yellow-300 mb-1">
                <MapPin size={14} />
                <span>{result.distance}km</span>
              </div>
              <div className="text-xs text-yellow-400">{result.duration}</div>
            </div>
          </div>

          {result.freeShipping && (
            <div className="mt-3 p-2 bg-green-900/40 border border-green-700 rounded text-center">
              <span className="text-green-200 text-sm font-medium">🎉 Chúc mừng! Miễn phí vận chuyển</span>
            </div>
          )}
        </div>
      )}

      {/* Chưa nhập địa chỉ */}
      {!result && !isCalculating && !error && selectedAddress && selectedAddress.trim().length < 5 && (
        <div className="text-center py-4 mb-4">
          <p className="text-yellow-300 text-sm">Vui lòng chọn địa chỉ giao hàng để tính phí vận chuyển</p>
        </div>
      )}

      {/* Chính sách */}
      <div className="text-sm text-yellow-200 space-y-2 bg-slate-800 rounded-lg p-3 border border-yellow-600/50">
        <div className="flex items-start gap-2">
          <span className="text-green-400 text-base">✓</span>
          <span>Miễn phí vận chuyển cho đơn hàng trong bán kính 2km</span>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-blue-400 text-base">ℹ</span>
          <span>2-5km: 14.000đ, 5-7km: 20.000đ, 7-10km: 25.000đ</span>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-red-400 text-base">⚠</span>
          <span>Không giao hàng cho địa chỉ cách xa hơn 10km</span>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-yellow-400 text-base">⏱</span>
          <span>Thời gian giao hàng: 15-30 phút tùy khoảng cách</span>
        </div>
      </div>
    </div>
  )


}

export default ShippingCalculator
