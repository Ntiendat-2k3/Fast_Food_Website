"use client"

const PaymentMethodCard = ({ method, selectedMethod, onSelect }) => {
  return (
    <div
      className={`border ${
        selectedMethod === method.id ? "border-yellow-400 bg-yellow-400/10" : "border-slate-600 bg-slate-700/30"
      } rounded-xl p-4 cursor-pointer hover:border-yellow-400/50 transition-all duration-300`}
      onClick={() => onSelect(method.id)}
    >
      <div className="flex items-center">
        <div
          className={`w-5 h-5 rounded-full border-2 ${
            selectedMethod === method.id ? "border-yellow-400" : "border-gray-400"
          } flex items-center justify-center mr-3`}
        >
          {selectedMethod === method.id && <div className="w-3 h-3 rounded-full bg-yellow-400"></div>}
        </div>
        <div className="flex items-center flex-1">
          {method.icon}
          <div className="ml-3">
            <span className="text-white font-medium">{method.name}</span>
            <p className="text-gray-400 text-sm">{method.description}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PaymentMethodCard
