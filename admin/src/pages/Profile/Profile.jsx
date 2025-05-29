import { Mail, Phone, MapPin, Github, Linkedin } from "lucide-react"

const Profile = () => {
  const teamMembers = [
    {
      id: 1,
      studentId: "A43575",
      name: "Phạm Khánh Duy",
      role: "Frontend Developer",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
      email: "duypk@example.com",
      phone: "0912345678",
      address: "Hà Nội, Việt Nam",
      github: "github.com/phamkhanhduy",
      linkedin: "linkedin.com/in/phamkhanhduy",
    },
    {
      id: 2,
      studentId: "A42005",
      name: "Nguyễn Tiến Đạt",
      role: "Backend Developer",
      avatar: "https://randomuser.me/api/portraits/men/41.jpg",
      email: "datnt@example.com",
      phone: "0923456789",
      address: "Hà Nội, Việt Nam",
      github: "github.com/nguyentien",
      linkedin: "linkedin.com/in/nguyentien",
    },
  ]

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white dark:bg-dark-light rounded-2xl shadow-custom p-6 mb-8">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Thông tin thành viên</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {teamMembers.map((member) => (
            <div
              key={member.id}
              className="bg-white dark:bg-dark rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow border border-gray-100 dark:border-dark-lighter"
            >
              <div className="h-32 bg-gradient-to-r from-primary to-primary-dark"></div>
              <div className="relative px-6 pb-6">
                <div className="absolute -top-12 left-1/2 transform -translate-x-1/2">
                  <img
                    src={member.avatar || "/placeholder.svg"}
                    alt={member.name}
                    className="w-24 h-24 rounded-full border-4 border-white dark:border-dark object-cover"
                  />
                </div>
                <div className="mt-14 text-center">
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white truncate">{member.name}</h3>
                  <p className="text-primary text-sm font-medium mb-1 truncate">{member.role}</p>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">MSSV: {member.studentId}</p>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <Mail size={16} className="text-gray-500 dark:text-gray-400 mr-2 flex-shrink-0" />
                      <span className="text-gray-600 dark:text-gray-300 truncate">{member.email}</span>
                    </div>
                    <div className="flex items-center">
                      <Phone size={16} className="text-gray-500 dark:text-gray-400 mr-2 flex-shrink-0" />
                      <span className="text-gray-600 dark:text-gray-300">{member.phone}</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin size={16} className="text-gray-500 dark:text-gray-400 mr-2 flex-shrink-0" />
                      <span className="text-gray-600 dark:text-gray-300 truncate">{member.address}</span>
                    </div>
                  </div>

                  <div className="flex justify-center space-x-4 mt-4">
                    <a
                      href={`https://${member.github}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-gray-100 dark:bg-dark-lighter rounded-full text-gray-700 dark:text-gray-300 hover:bg-primary hover:text-dark transition-colors"
                    >
                      <Github size={18} />
                    </a>
                    <a
                      href={`https://${member.linkedin}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-gray-100 dark:bg-dark-lighter rounded-full text-gray-700 dark:text-gray-300 hover:bg-primary hover:text-dark transition-colors"
                    >
                      <Linkedin size={18} />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-white dark:bg-dark rounded-xl p-6 shadow-md border border-gray-100 dark:border-dark-lighter">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Thông tin dự án</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-gray-800 dark:text-white">Fast Food Delivery</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Dự án website đặt đồ ăn nhanh với đầy đủ tính năng cho người dùng và quản trị viên.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-800 dark:text-white">Công nghệ sử dụng:</h4>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-full text-sm">
                  React
                </span>
                <span className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 rounded-full text-sm">
                  Node.js
                </span>
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 rounded-full text-sm">
                  MongoDB
                </span>
                <span className="px-3 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 rounded-full text-sm">
                  Express
                </span>
                <span className="px-3 py-1 bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300 rounded-full text-sm">
                  Tailwind CSS
                </span>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-800 dark:text-white">Tính năng chính:</h4>
              <ul className="list-disc list-inside mt-2 text-gray-600 dark:text-gray-300 space-y-1">
                <li>Đăng ký, đăng nhập tài khoản</li>
                <li>Xem danh sách món ăn, tìm kiếm và lọc theo danh mục</li>
                <li>Thêm món ăn vào giỏ hàng</li>
                <li>Đặt hàng và thanh toán</li>
                <li>Theo dõi trạng thái đơn hàng</li>
                <li>Quản lý sản phẩm (thêm, xóa)</li>
                <li>Quản lý đơn hàng</li>
                <li>Thống kê doanh thu</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
