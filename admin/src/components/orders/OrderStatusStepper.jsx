"use client"

import { Clock, Truck, CheckCircle, XCircle } from "lucide-react"

const OrderStatusStepper = ({ currentStatus }) => {
  const steps = [
    { status: "Food Processing", label: "Processing", icon: Clock, color: "orange" },
    { status: "Out for delivery", label: "Delivery", icon: Truck, color: "blue" },
    { status: "Delivered", label: "Delivered", icon: CheckCircle, color: "green" },
  ]

  const getCurrentStepIndex = () => {
    if (currentStatus === "Cancelled") return -1
    return steps.findIndex((step) => step.status === currentStatus)
  }

  const currentStepIndex = getCurrentStepIndex()

  if (currentStatus === "Cancelled") {
    return (
      <div className="flex items-center justify-center p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
        <XCircle className="w-4 h-4 text-red-400 mr-2" />
        <span className="text-sm font-medium text-red-400">Order Cancelled</span>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between p-3 bg-gray-800/20 rounded-lg border border-gray-700/30">
      {steps.map((step, index) => {
        const StepIcon = step.icon
        const isActive = index <= currentStepIndex
        const isCurrent = index === currentStepIndex

        return (
          <div key={step.status} className="flex items-center">
            <div
              className={`flex items-center justify-center w-6 h-6 rounded-full border-2 transition-all duration-300 ${
                isActive ? `bg-${step.color}-500 border-${step.color}-500` : "bg-gray-700 border-gray-600"
              }`}
            >
              <StepIcon className={`w-3 h-3 ${isActive ? "text-white" : "text-gray-400"}`} />
            </div>
            <span className={`ml-2 text-xs font-medium ${isActive ? `text-${step.color}-400` : "text-gray-400"}`}>
              {step.label}
            </span>
            {index < steps.length - 1 && (
              <div
                className={`w-8 h-0.5 mx-3 transition-all duration-300 ${
                  index < currentStepIndex ? `bg-${step.color}-500` : "bg-gray-600"
                }`}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

export default OrderStatusStepper
