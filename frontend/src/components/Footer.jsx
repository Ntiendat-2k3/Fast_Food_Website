import { Facebook, Twitter, Instagram } from "lucide-react"
import { Link } from "react-router-dom"

const Footer = () => {
  return (
    <footer className="bg-dark text-white">
      <div className="container mx-auto px-4 md:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center mb-6">
              <div className="bg-primary p-2 rounded-lg mr-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-dark"
                >
                  <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                </svg>
              </div>
              <span className="text-xl font-bold">GreenEats</span>
            </div>
            <p className="text-gray-400 mb-6">
              Chúng tôi cung cấp những món ăn ngon nhất với nguyên liệu tươi sạch và dịch vụ giao hàng nhanh chóng.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="bg-dark-lighter hover:bg-primary hover:text-dark p-2 rounded-full transition-colors"
              >
                <Facebook size={20} />
              </a>
              <a
                href="#"
                className="bg-dark-lighter hover:bg-primary hover:text-dark p-2 rounded-full transition-colors"
              >
                <Twitter size={20} />
              </a>
              <a
                href="#"
                className="bg-dark-lighter hover:bg-primary hover:text-dark p-2 rounded-full transition-colors"
              >
                <Instagram size={20} />
              </a>
            </div>
          </div>

          <div className="mt-8 sm:mt-0">
            <h3 className="text-lg font-bold mb-6">Thông tin</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-gray-400 hover:text-primary transition-colors">
                  Về chúng tôi
                </Link>
              </li>
              <li>
                <Link to="/" className="text-gray-400 hover:text-primary transition-colors">
                  Sự kiện
                </Link>
              </li>
              <li>
                <Link to="/" className="text-gray-400 hover:text-primary transition-colors">
                  Tìm kiếm
                </Link>
              </li>
              <li>
                <Link to="/" className="text-gray-400 hover:text-primary transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/" className="text-gray-400 hover:text-primary transition-colors">
                  Đánh giá
                </Link>
              </li>
            </ul>
          </div>

          <div className="mt-8 lg:mt-0">
            <h3 className="text-lg font-bold mb-6">Liên kết hữu ích</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-gray-400 hover:text-primary transition-colors">
                  Dịch vụ
                </Link>
              </li>
              <li>
                <Link to="/" className="text-gray-400 hover:text-primary transition-colors">
                  Hỗ trợ
                </Link>
              </li>
              <li>
                <Link to="/" className="text-gray-400 hover:text-primary transition-colors">
                  Điều khoản & Điều kiện
                </Link>
              </li>
              <li>
                <Link to="/" className="text-gray-400 hover:text-primary transition-colors">
                  Chính sách bảo mật
                </Link>
              </li>
            </ul>
          </div>

          <div className="mt-8 lg:mt-0">
            <h3 className="text-lg font-bold mb-6">Thực đơn của chúng tôi</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/foods" className="text-gray-400 hover:text-primary transition-colors">
                  Đặc biệt
                </Link>
              </li>
              <li>
                <Link to="/foods" className="text-gray-400 hover:text-primary transition-colors">
                  Phổ biến
                </Link>
              </li>
              <li>
                <Link to="/foods" className="text-gray-400 hover:text-primary transition-colors">
                  Danh mục
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm mb-4 md:mb-0 text-center md:text-left">
            &copy; {new Date().getFullYear()} GreenEats. Tất cả các quyền được bảo lưu.
          </p>
          <div className="flex flex-wrap justify-center md:justify-end gap-4 md:space-x-6">
            <Link to="/" className="text-gray-400 hover:text-primary transition-colors text-sm">
              Chính sách bảo mật
            </Link>
            <Link to="/" className="text-gray-400 hover:text-primary transition-colors text-sm">
              Điều khoản dịch vụ
            </Link>
            <Link to="/" className="text-gray-400 hover:text-primary transition-colors text-sm">
              Cài đặt cookie
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
