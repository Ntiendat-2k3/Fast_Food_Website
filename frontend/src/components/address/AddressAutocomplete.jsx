"use client"

import { useState, useEffect, useRef } from "react"
import { MapPin, X } from "lucide-react"
import axios from "axios"

const AddressAutocomplete = ({ value, onChange, onAddressSelect, placeholder, className = "" }) => {
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [loading, setLoading] = useState(false)
  const [inputValue, setInputValue] = useState(value || "")
  const debounceRef = useRef(null)
  const inputRef = useRef(null)
  const suggestionsRef = useRef(null)

  const url = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000"

  useEffect(() => {
    setInputValue(value || "")
  }, [value])

  const fetchSuggestions = async (input) => {
    if (!input.trim() || input.length < 3) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    setLoading(true)
    try {
      const response = await axios.get(`${url}/api/shipping/address-suggestions`, {
        params: { input },
      })

      if (response.data.success) {
        setSuggestions(response.data.data)
        setShowSuggestions(true)
      }
    } catch (error) {
      console.error("Error fetching suggestions:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const newValue = e.target.value
    setInputValue(newValue)
    onChange?.(newValue)

    // Debounce API calls
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    debounceRef.current = setTimeout(() => {
      fetchSuggestions(newValue)
    }, 300)
  }

  const handleSuggestionClick = async (suggestion) => {
    setInputValue(suggestion.description)
    setShowSuggestions(false)
    onChange?.(suggestion.description)

    // Get place details if callback provided
    if (onAddressSelect) {
      try {
        const response = await axios.get(`${url}/api/shipping/place-details/${suggestion.placeId}`)
        if (response.data.success) {
          onAddressSelect({
            address: response.data.data.address,
            lat: response.data.data.lat,
            lng: response.data.data.lng,
            placeId: suggestion.placeId,
          })
        }
      } catch (error) {
        console.error("Error getting place details:", error)
      }
    }
  }

  const clearInput = () => {
    setInputValue("")
    setSuggestions([])
    setShowSuggestions(false)
    onChange?.("")
    inputRef.current?.focus()
  }

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target) &&
        !inputRef.current?.contains(event.target)
      ) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder={placeholder || "Nhập địa chỉ giao hàng..."}
          className="w-full bg-slate-700/50 text-white border border-slate-600 rounded-xl py-3 pl-10 pr-10 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
          autoComplete="off"
        />
        {inputValue && (
          <button
            type="button"
            onClick={clearInput}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        )}
        {loading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-400"></div>
          </div>
        )}
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-slate-800 border border-slate-600 rounded-xl shadow-2xl max-h-60 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion.placeId}
              type="button"
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full text-left px-4 py-3 hover:bg-slate-700 transition-colors border-b border-slate-700 last:border-b-0 focus:outline-none focus:bg-slate-700"
            >
              <div className="flex items-start">
                <MapPin size={16} className="text-yellow-400 mt-1 mr-3 flex-shrink-0" />
                <div>
                  <div className="text-white font-medium text-sm">{suggestion.mainText}</div>
                  <div className="text-gray-400 text-xs mt-1">{suggestion.secondaryText}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No results */}
      {showSuggestions && suggestions.length === 0 && !loading && inputValue.length >= 3 && (
        <div className="absolute z-50 w-full mt-1 bg-slate-800 border border-slate-600 rounded-xl shadow-2xl p-4">
          <div className="text-gray-400 text-sm text-center">Không tìm thấy địa chỉ phù hợp</div>
        </div>
      )}
    </div>
  )
}

export default AddressAutocomplete
