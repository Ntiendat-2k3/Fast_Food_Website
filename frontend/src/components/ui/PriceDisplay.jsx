"use client"

const PriceDisplay = ({ price, originalPrice, currency = "đ", size = "md", className = "" }) => {
  const sizes = {
    sm: "text-sm",
    md: "text-lg",
    lg: "text-2xl",
    xl: "text-3xl",
  }

  const formatPrice = (amount) => {
    return amount.toLocaleString("vi-VN")
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className={`font-bold text-primary ${sizes[size]}`}>
        {formatPrice(price)} {currency}
      </span>

      {originalPrice && originalPrice > price && (
        <span
          className={`text-gray-500 line-through ${
            size === "xl" ? "text-lg" : size === "lg" ? "text-base" : size === "md" ? "text-sm" : "text-xs"
          }`}
        >
          {formatPrice(originalPrice)} {currency}
        </span>
      )}
    </div>
  )
}

export default PriceDisplay
