import { MessageSquare, Shield, Bell } from "lucide-react"

const EmptyState = ({ type }) => {
  let icon, title, message

  switch (type) {
    case "comments":
      icon = <MessageSquare size={64} className="mx-auto mb-4 text-gray-400" />
      title = "Không có đánh giá nào"
      message = "Chưa có đánh giá nào phù hợp với tìm kiếm của bạn"
      break
    case "notifications":
      icon = <Bell size={40} className="mx-auto mb-3 text-gray-400" />
      title = "Chưa có thông báo nào"
      message = ""
      break
    case "blacklist":
      icon = <Shield size={40} className="mx-auto mb-3 text-gray-400" />
      title = "Không có người dùng nào bị chặn"
      message = ""
      break
    default:
      icon = <MessageSquare size={64} className="mx-auto mb-4 text-gray-400" />
      title = "Không có dữ liệu"
      message = "Không có dữ liệu nào phù hợp với tìm kiếm của bạn"
  }

  return (
    <div className="text-center py-8 bg-gray-50 dark:bg-dark-lighter rounded-lg">
      {icon}
      <h3 className="text-xl text-gray-500 dark:text-gray-400 mb-2">{title}</h3>
      {message && <p className="text-gray-400 dark:text-gray-500">{message}</p>}
    </div>
  )
}

export default EmptyState
