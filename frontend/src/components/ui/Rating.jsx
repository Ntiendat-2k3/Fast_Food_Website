"use client"

import { Star } from "lucide-react"

const Rating = ({
  value = 0,
  max = 5,
  size = "md",
  interactive = false,
  onChange,
  showValue = false,
  className = "",
}) => {
  const sizes = {
    sm: 14,
    md: 18,
    lg: 24,
  }

  const handleClick = (rating) => {
    if (interactive && onChange) {
      onChange(rating)
    }
  }

  return (
    <div className={`flex items-center ${className}`}>
      <div className="flex">
        {[...Array(max)].map((_, index) => {
          const rating = index + 1
          const filled = rating <= value

          return (
            <Star
              key={index}
              size={sizes[size]}
              className={`${
                filled ? "text-primary fill-primary" : "text-gray-500"
              } ${interactive ? "cursor-pointer hover:text-primary" : ""} transition-colors`}
              onClick={() => handleClick(rating)}
            />
          )
        })}
      </div>

      {showValue && <span className="ml-2 text-sm text-gray-300">{value.toFixed(1)}</span>}
    </div>
  )
}

export default Rating
