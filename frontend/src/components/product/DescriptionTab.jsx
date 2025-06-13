import { Check } from "lucide-react"

const DescriptionTab = ({ product }) => {
  return (
    <div className="prose prose-invert max-w-none">
      <h3 className="text-2xl font-bold text-white mb-4">Giới thiệu về {product.name}</h3>
      <p className="text-gray-300 leading-relaxed mb-4">
        {product.description} Được chế biến từ những nguyên liệu tươi ngon nhất, đảm bảo mang đến cho bạn trải nghiệm ẩm
        thực tuyệt vời nhất.
      </p>
      <p className="text-gray-300 leading-relaxed mb-6">
        Món ăn này được đầu bếp của chúng tôi chế biến theo công thức truyền thống, kết hợp với kỹ thuật hiện đại để tạo
        ra hương vị độc đáo, khó quên.
      </p>
      <h4 className="text-xl font-semibold text-white mb-3">Đặc điểm nổi bật</h4>
      <ul className="space-y-2 text-gray-300">
        <li className="flex items-center">
          <Check size={16} className="text-primary mr-2" />
          Nguyên liệu tươi sạch, được lựa chọn kỹ lưỡng
        </li>
        <li className="flex items-center">
          <Check size={16} className="text-primary mr-2" />
          Chế biến theo công thức độc quyền
        </li>
        <li className="flex items-center">
          <Check size={16} className="text-primary mr-2" />
          Không sử dụng chất bảo quản
        </li>
        <li className="flex items-center">
          <Check size={16} className="text-primary mr-2" />
          Đóng gói cẩn thận, giữ nguyên hương vị
        </li>
      </ul>
    </div>
  )
}

export default DescriptionTab
