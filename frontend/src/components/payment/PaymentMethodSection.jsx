"use client"
import PaymentMethodCard from "./PaymentMethodCard"

const PaymentMethodSection = ({ methods, selectedMethod, onSelectMethod }) => {
  return (
    <div className="mt-6">
      <h3 className="text-lg font-medium text-white mb-4">Phương thức thanh toán</h3>
      <div className="grid grid-cols-1 gap-3">
        {methods.map((method) => (
          <PaymentMethodCard
            key={method.id}
            method={method}
            selectedMethod={selectedMethod}
            onSelect={onSelectMethod}
          />
        ))}
      </div>
    </div>
  )
}

export default PaymentMethodSection
