"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { MapPin, Search, Loader2, AlertCircle, Navigation, Star, Database, Globe, Zap } from "lucide-react"
import axios from "axios"

const AddressAutocomplete = ({
  value = "",
  onChange,
  onSelect,
  placeholder = "Nhập địa chỉ giao hàng...",
  className = "",
  disabled = false,
}) => {
  const [suggestions, setSuggestions] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [error, setError] = useState("")
  const [hasSearched, setHasSearched] = useState(false)
  const [searchStats, setSearchStats] = useState(null)

  const inputRef = useRef(null)
  const suggestionsRef = useRef(null)
  const debounceRef = useRef(null)
  const abortControllerRef = useRef(null)

  const url = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000"

  // Debounced search function
  const debouncedSearch = useCallback(
    async (searchTerm) => {
      if (!searchTerm || searchTerm.length < 2) {
        setSuggestions([])
        setShowSuggestions(false)
        setHasSearched(false)
        setSearchStats(null)
        return
      }

      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      abortControllerRef.current = new AbortController()

      setIsLoading(true)
      setError("")
      setHasSearched(true)

      const startTime = Date.now()

      try {
        console.log(`🔍 Searching for: "${searchTerm}"`)

        const response = await axios.get(`${url}/api/shipping/address-suggestions`, {
          params: { input: searchTerm },
          timeout: 15000,
          signal: abortControllerRef.current.signal,
        })

        const endTime = Date.now()
        const searchTime = endTime - startTime

        if (response.data.success) {
          const suggestions = response.data.data || []
          setSuggestions(suggestions)
          setShowSuggestions(true)
          setSelectedIndex(-1)

          // Set search stats
          setSearchStats({
            count: suggestions.length,
            time: searchTime,
            sources: [...new Set(suggestions.map((s) => s.source))],
          })

          console.log(`✅ Found ${suggestions.length} suggestions in ${searchTime}ms`)
        } else {
          setError(response.data.message || "Không thể tìm kiếm địa chỉ")
          setSuggestions([])
          setShowSuggestions(false)
          setSearchStats(null)
        }
      } catch (err) {
        if (err.name === "AbortError") {
          console.log("🚫 Search request was aborted")
          return
        }

        console.error("❌ Address search error:", err)

        let errorMessage = "Lỗi khi tìm kiếm địa chỉ"
        if (err.code === "ECONNABORTED") {
          errorMessage = "Kết nối mạng chậm, vui lòng thử lại"
        } else if (err.response?.status === 500) {
          errorMessage = "Lỗi server, vui lòng thử lại sau"
        } else if (!navigator.onLine) {
          errorMessage = "Không có kết nối internet"
        } else if (err.message.includes("timeout")) {
          errorMessage = "Timeout - thử lại với từ khóa ngắn hơn"
        }

        setError(errorMessage)
        setSuggestions([])
        setShowSuggestions(false)
        setSearchStats(null)
      } finally {
        setIsLoading(false)
      }
    },
    [url],
  )

  // Handle input change with debouncing
  const handleInputChange = (e) => {
    const newValue = e.target.value
    onChange?.(newValue)

    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    // Set new debounce
    debounceRef.current = setTimeout(() => {
      debouncedSearch(newValue)
    }, 300)
  }

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion) => {
    console.log(`📍 Selected: ${suggestion.description}`)
    onChange?.(suggestion.description)
    onSelect?.(suggestion)
    setShowSuggestions(false)
    setSelectedIndex(-1)
    setSuggestions([])
    setError("")
    setHasSearched(false)
    setSearchStats(null)
  }

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0))
        break

      case "ArrowUp":
        e.preventDefault()
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1))
        break

      case "Enter":
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionSelect(suggestions[selectedIndex])
        }
        break

      case "Escape":
        setShowSuggestions(false)
        setSelectedIndex(-1)
        inputRef.current?.blur()
        break
    }
  }

  // Handle focus
  const handleFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true)
    }
  }

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target)
      ) {
        setShowSuggestions(false)
        setSelectedIndex(-1)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  // Get confidence color
  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return "text-green-500"
    if (confidence >= 0.6) return "text-yellow-500"
    return "text-red-500"
  }

  // Get confidence stars
  const getConfidenceStars = (confidence) => {
    const stars = Math.round(confidence * 5)
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} size={12} className={i < stars ? "text-yellow-400 fill-current" : "text-gray-300"} />
    ))
  }

  // Get source icon
  const getSourceIcon = (source) => {
    switch (source) {
      case "Local Database":
      case "Local Fuzzy":
        return <Database size={14} className="text-blue-500" />
      case "Nominatim":
      case "Photon":
        return <Globe size={14} className="text-green-500" />
      default:
        return <Zap size={14} className="text-purple-500" />
    }
  }

  return (
    <div className={`relative ${className}`}>
      {/* Input field */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            w-full px-4 py-3 pl-12 pr-12 border border-gray-300 rounded-lg
            focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            disabled:bg-gray-100 disabled:cursor-not-allowed
            transition-all duration-200
            ${error ? "border-red-500 focus:ring-red-500 focus:border-red-500" : ""}
          `}
        />

        {/* Search icon */}
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          <Search size={20} />
        </div>

        {/* Loading spinner */}
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <Loader2 className="animate-spin text-blue-500" size={20} />
          </div>
        )}

        {/* Clear button */}
        {!isLoading && value && (
          <button
            onClick={() => {
              onChange?.("")
              setSuggestions([])
              setShowSuggestions(false)
              setError("")
              setHasSearched(false)
              setSearchStats(null)
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xl leading-none"
          >
            ×
          </button>
        )}
      </div>

      {/* Search stats */}
      {searchStats && !isLoading && (
        <div className="mt-1 text-xs text-gray-500 flex items-center gap-2">
          <span>🔍 {searchStats.count} kết quả</span>
          <span>⚡ {searchStats.time}ms</span>
          <span>📡 {searchStats.sources.join(", ")}</span>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center text-red-700">
            <AlertCircle size={16} className="mr-2 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
          <div className="mt-2 text-xs text-red-600">
            💡 Thử nhập: "Đại học Đại Nam", "Bách Khoa Hà Nội", hoặc "Hoàn Kiếm, Hà Nội"
          </div>
        </div>
      )}

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => (
            <div
              key={suggestion.placeId || index}
              onClick={() => handleSuggestionSelect(suggestion)}
              className={`
                px-4 py-3 cursor-pointer border-b border-gray-100 last:border-b-0
                hover:bg-blue-50 transition-colors duration-150
                ${index === selectedIndex ? "bg-blue-50 border-blue-200" : ""}
              `}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  <MapPin className="text-blue-500" size={16} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 line-clamp-1">{suggestion.mainText}</div>
                  {suggestion.secondaryText && (
                    <div className="text-xs text-gray-500 mt-1 line-clamp-2">{suggestion.secondaryText}</div>
                  )}

                  {/* Confidence and source info */}
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-1">
                      {getConfidenceStars(suggestion.confidence)}
                      <span className={`text-xs font-medium ${getConfidenceColor(suggestion.confidence)}`}>
                        {Math.round(suggestion.confidence * 100)}%
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        {getSourceIcon(suggestion.source)}
                        <span className="text-xs text-gray-600">{suggestion.source}</span>
                      </div>
                      <Navigation className="text-gray-400" size={12} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Footer */}
          <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>🗺️ Dữ liệu từ OpenStreetMap & Local DB</span>
              <span>{suggestions.length} kết quả</span>
            </div>
          </div>
        </div>
      )}

      {/* No results message */}
      {showSuggestions && suggestions.length === 0 && !isLoading && hasSearched && value.length >= 2 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4">
          <div className="text-center text-gray-500">
            <MapPin className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm font-medium">Không tìm thấy địa chỉ phù hợp</p>
            <p className="text-xs text-gray-400 mt-1">Thử nhập chi tiết hơn hoặc sử dụng các gợi ý bên dưới</p>

            {/* Popular suggestions */}
            <div className="mt-3 space-y-1">
              <p className="text-xs font-medium text-gray-600">🔥 Địa chỉ phổ biến:</p>
              <div className="flex flex-wrap gap-1">
                {["Đại học Đại Nam", "Bách Khoa Hà Nội", "Hoàn Kiếm", "Cầu Giấy"].map((addr) => (
                  <button
                    key={addr}
                    onClick={() => {
                      onChange?.(addr)
                      debouncedSearch(addr)
                    }}
                    className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                  >
                    {addr}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Helpful hints */}
      {!showSuggestions && !hasSearched && value.length === 0 && (
        <div className="mt-2 text-xs text-gray-500">
          <p>
            💡 <strong>Gợi ý tìm kiếm:</strong>
          </p>
          <div className="mt-1 space-y-1">
            <p>• Trường học: "Đại học Đại Nam", "Bách Khoa Hà Nội"</p>
            <p>• Quận/huyện: "Hoàn Kiếm", "Cầu Giấy", "Thanh Xuân"</p>
            <p>• Địa điểm: "Hồ Gươm", "Chợ Đồng Xuân"</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default AddressAutocomplete
