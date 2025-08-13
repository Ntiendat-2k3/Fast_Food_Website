"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Search, MapPin, X, Loader2 } from "lucide-react"
import axios from "axios"

const AddressAutocomplete = ({
  value,
  onChange,
  onSelect,
  placeholder = "Nhập địa chỉ...",
  disabled = false,
  className = "",
}) => {
  const [suggestions, setSuggestions] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef(null)
  const suggestionsRef = useRef(null)
  const debounceRef = useRef(null)

  const url = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000"

  // Debounced search function
  const debouncedSearch = useCallback(
    (query) => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }

      debounceRef.current = setTimeout(async () => {
        if (query.length < 2) {
          setSuggestions([])
          setShowSuggestions(false)
          return
        }

        setIsLoading(true)
        try {
          console.log("Searching for address:", query)
          const response = await axios.get(`${url}/api/shipping/suggestions?input=${encodeURIComponent(query)}`, {
            timeout: 10000,
          })

          console.log("Address suggestions response:", response.data)

          if (response.data.success && response.data.data && response.data.data.length > 0) {
            setSuggestions(response.data.data)
            setShowSuggestions(true)
          } else {
            setSuggestions([])
            setShowSuggestions(false)
          }
        } catch (error) {
          console.error("Autocomplete error:", error)
          setSuggestions([])
          setShowSuggestions(false)
        } finally {
          setIsLoading(false)
        }
      }, 300)
    },
    [url],
  )

  // Handle input change
  const handleInputChange = (e) => {
    const newValue = e.target.value
    onChange(newValue)
    setSelectedIndex(-1)
    debouncedSearch(newValue)
  }

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion) => {
    const selectedAddress = suggestion.description || suggestion.mainText || suggestion.address
    onChange(selectedAddress)
    onSelect?.(suggestion)
    setShowSuggestions(false)
    setSuggestions([])
    setSelectedIndex(-1)
    inputRef.current?.blur()
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
        inputRef.current?.blur()
        break
    }
  }

  // Clear input
  const handleClear = () => {
    onChange("")
    setSuggestions([])
    setShowSuggestions(false)
    setSelectedIndex(-1)
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
        setSelectedIndex(-1)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [])

  return (
    <div className={`relative ${className}`}>
      {/* Input Field */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {isLoading ? (
            <Loader2 className="h-4 w-4 text-gray-400 animate-spin" />
          ) : (
            <Search className="h-4 w-4 text-gray-400" />
          )}
        </div>

        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowSuggestions(true)
            }
          }}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            w-full pl-10 pr-10 py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-gray-400
            focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400
            disabled:bg-gray-700 disabled:cursor-not-allowed
            transition-all duration-200
          `}
        />

        {/* Clear Button */}
        {value && !disabled && (
          <button
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-300 transition-colors"
          >
            <X className="h-4 w-4 text-gray-400" />
          </button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-slate-800 border border-slate-600 rounded-lg shadow-xl max-h-60 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion.placeId || suggestion.place_id || index}
              onClick={() => handleSuggestionSelect(suggestion)}
              className={`
                w-full px-4 py-3 text-left hover:bg-slate-700 transition-colors
                flex items-start gap-3 border-b border-slate-700 last:border-b-0
                ${index === selectedIndex ? "bg-slate-700 border-yellow-500/50" : ""}
              `}
            >
              <MapPin className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white truncate">
                  {suggestion.mainText || suggestion.description || suggestion.address}
                </p>
                {suggestion.secondaryText && (
                  <p className="text-xs text-gray-400 truncate mt-1">{suggestion.secondaryText}</p>
                )}
                {suggestion.source && <p className="text-xs text-yellow-500 mt-1">Nguồn: {suggestion.source}</p>}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No Results */}
      {showSuggestions && suggestions.length === 0 && !isLoading && value.length >= 2 && (
        <div className="absolute z-50 w-full mt-1 bg-slate-800 border border-slate-600 rounded-lg shadow-xl p-4">
          <p className="text-sm text-gray-400 text-center">Không tìm thấy địa chỉ phù hợp</p>
        </div>
      )}
    </div>
  )
}

export default AddressAutocomplete
