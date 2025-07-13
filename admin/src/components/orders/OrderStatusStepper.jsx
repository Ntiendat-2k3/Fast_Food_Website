"use client"

import { Clock, Utensils, Truck, CheckCircle } from "lucide-react"
import { cn } from "../../lib/utils" // Corrected import path for cn

const STATUS_STEPS = [
  { status: "Đang xử lý", icon: Clock },
  { status: "Đang chuẩn bị đồ", icon: Utensils },
  { status: "Đang giao hàng", icon: Truck },
  { status: "Đã giao", icon: CheckCircle },
]

const OrderStatusStepper = ({ currentStatus, orderId, onStatusChange }) => {
  const currentIndex = STATUS_STEPS.findIndex((step) => step.status === currentStatus)

  const handleStepClick = (newStatus, index) => {
    // Prevent moving backward or clicking the current/already completed steps
    // Also, only allow moving to the immediate next step
    if (index <= currentIndex || index > currentIndex + 1) {
      return
    }
    onStatusChange(orderId, newStatus)
  }

  return (
    <div className="flex items-center justify-between w-full max-w-md mx-auto mt-4 sm:mt-0">
      {STATUS_STEPS.map((step, index) => {
        const Icon = step.icon
        const isCompleted = index < currentIndex
        const isActive = index === currentIndex
        const isDisabled = index < currentIndex || index > currentIndex + 1 // Can only move to next step

        return (
          <div key={step.status} className="flex items-center flex-1">
            <div
              className={cn(
                "flex flex-col items-center relative z-10 cursor-pointer transition-all duration-300",
                isDisabled ? "opacity-50 cursor-not-allowed" : "hover:scale-105",
              )}
              onClick={() => !isDisabled && handleStepClick(step.status, index)}
            >
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-white",
                  isCompleted
                    ? "bg-green-500"
                    : isActive
                      ? "bg-primary"
                      : "bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300",
                )}
              >
                <Icon size={16} />
              </div>
              <span
                className={cn(
                  "mt-1 text-xs text-center font-medium whitespace-nowrap",
                  isCompleted
                    ? "text-green-600 dark:text-green-400"
                    : isActive
                      ? "text-primary dark:text-primary-light"
                      : "text-gray-500 dark:text-gray-400",
                )}
              >
                {step.status}
              </span>
            </div>
            {index < STATUS_STEPS.length - 1 && (
              <div
                className={cn(
                  "flex-1 h-0.5 mx-2 transition-all duration-300",
                  isCompleted ? "bg-green-500" : isActive ? "bg-primary" : "bg-gray-300 dark:bg-gray-600",
                )}
              ></div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default OrderStatusStepper
