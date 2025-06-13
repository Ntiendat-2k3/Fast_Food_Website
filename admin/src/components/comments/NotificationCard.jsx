"use client"
import { Calendar, Eye, EyeOff, Trash2 } from "lucide-react"

const NotificationCard = ({
  notification,
  handleMarkNotificationRead,
  handleDeleteNotification,
  getNotificationTypeStyle,
  formatDate,
}) => {
  return (
    <div
      className={`border rounded-lg overflow-hidden ${notification.read ? "border-gray-200 dark:border-gray-700" : "border-primary dark:border-primary/70"}`}
    >
      <div className={`px-4 py-3 flex justify-between items-center ${getNotificationTypeStyle(notification.type)}`}>
        <div className="font-medium">{notification.title}</div>
        <div className="flex items-center space-x-1">
          {notification.read ? (
            <button
              onClick={() => handleMarkNotificationRead(notification._id, false)}
              className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              title="Đánh dấu chưa đọc"
            >
              <EyeOff size={16} />
            </button>
          ) : (
            <button
              onClick={() => handleMarkNotificationRead(notification._id, true)}
              className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              title="Đánh dấu đã đọc"
            >
              <Eye size={16} />
            </button>
          )}
          <button
            onClick={() => handleDeleteNotification(notification._id)}
            className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            title="Xóa thông báo"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      <div className="p-4 bg-white dark:bg-dark">
        <p className="text-gray-700 dark:text-gray-300 mb-3">{notification.message}</p>
        <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center">
            <Calendar size={14} className="mr-1" />
            {formatDate(notification.createdAt)}
          </div>
          <div>{notification.targetUser === "all" ? "Tất cả người dùng" : "Người dùng cụ thể"}</div>
        </div>
      </div>
    </div>
  )
}

export default NotificationCard
