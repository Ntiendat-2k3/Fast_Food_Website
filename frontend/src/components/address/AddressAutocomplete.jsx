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
        if (query.length < 3) {
          setSuggestions([])
          setShowSuggestions(false)
          return
        }

        setIsLoading(true)
        try {
          const response = await axios.get(`${url}/api/shipping/autocomplete?input=${encodeURIComponent(query)}`, {
            timeout: 10000,
          })

          if (response.data.success && response.data.predictions) {
            setSuggestions(response.data.predictions)
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
    onChange(suggestion.description)
    onSelect(suggestion)
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
            w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg
            focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            disabled:bg-gray-100 disabled:cursor-not-allowed
            text-sm placeholder-gray-500
            transition-colors duration-200
          `}
        />

        {/* Clear Button */}
        {value && !disabled && (
          <button
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-600 transition-colors"
          >
            <X className="h-4 w-4 text-gray-400" />
          </button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion.place_id || index}
              onClick={() => handleSuggestionSelect(suggestion)}
              className={`
                w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors
                flex items-start gap-3 border-b border-gray-100 last:border-b-0
                ${index === selectedIndex ? "bg-blue-50 border-blue-200" : ""}
              `}
            >
              <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 truncate">
                  {suggestion.structured_formatting?.main_text || suggestion.description}
                </p>
                {suggestion.structured_formatting?.secondary_text && (
                  <p className="text-xs text-gray-500 truncate mt-1">
                    {suggestion.structured_formatting.secondary_text}
                  </p>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No Results */}
      {showSuggestions && suggestions.length === 0 && !isLoading && value.length >= 3 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4">
          <p className="text-sm text-gray-500 text-center">Không tìm thấy địa chỉ phù hợp</p>
        </div>
      )}
    </div>
  )
}

export default AddressAutocomplete
