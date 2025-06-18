"use client"

import { useState, useEffect, useRef } from "react"
import { MapPin, Search, Loader2, Navigation, AlertCircle } from "lucide-react"
import axios from "axios"

const AddressAutocomplete = ({ value, onChange, placeholder, className, error }) => {
  const [suggestions, setSuggestions] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [inputValue, setInputValue] = useState(value || "")

  const inputRef = useRef(null)
  const suggestionsRef = useRef(null)
  const debounceRef = useRef(null)

  const url = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000"

  // Update input value when prop changes
  useEffect(() => {
    setInputValue(value || "")
  }, [value])

  // Debounced search function
  const searchAddresses = async (query) => {
    if (!query || query.length < 3) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    setIsLoading(true)

    try {
      const response = await axios.get(`${url}/api/shipping/address-suggestions`, {
        params: { input: query },
        timeout: 5000,
      })

      if (response.data.success) {
        setSuggestions(response.data.data || [])
        setShowSuggestions(true)
      } else {
        setSuggestions([])
        setShowSuggestions(false)
      }
    } catch (error) {
      console.error("Error fetching address suggestions:", error)
      setSuggestions([])
      setShowSuggestions(false)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle input change with debouncing
  const handleInputChange = (e) => {
    const newValue = e.target.value
    setInputValue(newValue)
    onChange?.(newValue)
    setSelectedIndex(-1)

    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    // Set new debounce
    debounceRef.current = setTimeout(() => {
      searchAddresses(newValue)
    }, 300)
  }

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion) => {
    setInputValue(suggestion.description)
    onChange?.(suggestion.description)
    setShowSuggestions(false)
    setSelectedIndex(-1)
    setSuggestions([])
  }

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev))
        break
      case "ArrowUp":
        e.preventDefault()
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1))
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
        break
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
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [])

  const getHighlightedText = (text, query) => {
    if (!query) return text

    const parts = text.split(new RegExp(`(${query})`, "gi"))
    return parts.map((part, index) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <span key={index} className="bg-yellow-400/30 text-yellow-300 font-medium">
          {part}
        </span>
      ) : (
        part
      ),
    )
  }

  return (
    <div className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowSuggestions(true)
            }
          }}
          placeholder={placeholder || "Nhập địa chỉ để tìm kiếm..."}
          className={`w-full pl-10 pr-10 py-3 bg-slate-800/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all ${
            error ? "border-red-500" : "border-slate-600"
          } ${className || ""}`}
        />

        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />

        {isLoading && (
          <Loader2
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-yellow-400 animate-spin"
            size={18}
          />
        )}

        {!isLoading && inputValue && (
          <button
            onClick={() => {
              setInputValue("")
              onChange?.("")
              setSuggestions([])
              setShowSuggestions(false)
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
          >
            ×
          </button>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="flex items-center mt-2 text-red-400 text-sm">
          <AlertCircle size={16} className="mr-1" />
          {error}
        </div>
      )}

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-slate-800 border border-slate-600 rounded-lg shadow-xl max-h-60 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion.placeId}
              onClick={() => handleSuggestionSelect(suggestion)}
              className={`w-full text-left px-4 py-3 hover:bg-slate-700 transition-colors border-b border-slate-700 last:border-b-0 ${
                index === selectedIndex ? "bg-slate-700" : ""
              }`}
            >
              <div className="flex items-start">
                <MapPin className="text-yellow-400 mr-3 mt-1 flex-shrink-0" size={16} />
                <div className="flex-1 min-w-0">
                  <div className="text-white font-medium text-sm line-clamp-1">
                    {getHighlightedText(suggestion.mainText, inputValue)}
                  </div>
                  <div className="text-gray-400 text-xs mt-1 line-clamp-2">
                    {getHighlightedText(suggestion.secondaryText, inputValue)}
                  </div>
                  {suggestion.confidence && (
                    <div className="flex items-center mt-1">
                      <Navigation className="text-blue-400 mr-1" size={12} />
                      <span className="text-blue-400 text-xs">
                        Độ chính xác: {Math.round(suggestion.confidence * 100)}%
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </button>
          ))}

          {/* Footer info */}
          <div className="px-4 py-2 bg-slate-900/50 border-t border-slate-700">
            <div className="flex items-center text-xs text-gray-500">
              <Navigation className="mr-1" size={12} />
              Dữ liệu từ OpenStreetMap
            </div>
          </div>
        </div>
      )}

      {/* No results message */}
      {showSuggestions && !isLoading && suggestions.length === 0 && inputValue.length >= 3 && (
        <div className="absolute z-50 w-full mt-1 bg-slate-800 border border-slate-600 rounded-lg shadow-xl p-4">
          <div className="flex items-center text-gray-400">
            <AlertCircle className="mr-2" size={16} />
            <span className="text-sm">Không tìm thấy địa chỉ phù hợp</span>
          </div>
          <div className="text-xs text-gray-500 mt-2">
            Hãy thử nhập địa chỉ chi tiết hơn (số nhà, tên đường, quận/huyện)
          </div>
        </div>
      )}
    </div>
  )
}

export default AddressAutocomplete
