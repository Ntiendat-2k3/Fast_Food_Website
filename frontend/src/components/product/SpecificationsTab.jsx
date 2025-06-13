import { Info, Clock } from "lucide-react"

const SpecificationsTab = ({ productDetails }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-slate-700/30 rounded-xl p-6 border border-slate-600">
        <h3 className="text-xl font-semibold text-white mb-6">Thông tin chi tiết</h3>
        <div className="space-y-4">
          {[
            { label: "Khối lượng", value: productDetails.weight },
            { label: "Thành phần", value: productDetails.ingredients },
            { label: "Xuất xứ", value: productDetails.origin },
            { label: "Hạn sử dụng", value: productDetails.expiry },
            { label: "Bảo quản", value: productDetails.storage },
          ].map((item, index) => (
            <div key={index} className="flex justify-between items-start border-b border-slate-600 pb-3">
              <span className="text-gray-400 font-medium">{item.label}</span>
              <span className="text-white text-right max-w-xs">{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-slate-700/30 rounded-xl p-6 border border-slate-600">
        <h3 className="text-xl font-semibold text-white mb-6">Thông tin dinh dưỡng</h3>
        <div className="grid grid-cols-2 gap-4 mb-6">
          {Object.entries(productDetails.nutrition).map(([key, value], index) => (
            <div key={index} className="bg-slate-800/50 p-3 rounded-lg text-center">
              <p className="text-gray-400 text-sm capitalize">{key}</p>
              <p className="font-semibold text-white">{value}</p>
            </div>
          ))}
        </div>
        <div className="space-y-3">
          <div className="flex items-center text-gray-300">
            <Info size={16} className="text-primary mr-2" />
            <span className="text-sm">Thông tin dinh dưỡng chỉ mang tính chất tham khảo</span>
          </div>
          <div className="flex items-center text-gray-300">
            <Clock size={16} className="text-primary mr-2" />
            <span className="text-sm">Thời gian chuẩn bị: 15-20 phút</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SpecificationsTab
