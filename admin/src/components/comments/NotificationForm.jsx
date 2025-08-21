"use client"
import { Send } from "lucide-react"

const NotificationForm = ({ newNotification, setNewNotification, handleSendNotification, users }) => {
  return (
    <div className="bg-gray-50 dark:bg-dark rounded-lg p-4 mb-6">
      <h3 className="text-md font-medium text-gray-800 dark:text-white mb-4">Tạo thông báo mới</h3>

      <div className="space-y-4">
        <div>
          <label
            htmlFor="notification-title"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Tiêu đề
          </label>
          <input
            id="notification-title"
            type="text"
            value={newNotification.title}
            onChange={(e) => setNewNotification({ ...newNotification, title: e.target.value })}
            placeholder="Nhập tiêu đề thông báo"
            className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark py-2 px-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label
            htmlFor="notification-message"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Nội dung
          </label>
          <textarea
            id="notification-message"
            value={newNotification.message}
            onChange={(e) => setNewNotification({ ...newNotification, message: e.target.value })}
            placeholder="Nhập nội dung thông báo"
            rows={3}
            className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark py-2 px-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="notification-target"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Đối tượng
            </label>
            <select
              id="notification-target"
              value={newNotification.targetUser}
              onChange={(e) => setNewNotification({ ...newNotification, targetUser: e.target.value })}
              className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark py-2 px-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">Tất cả người dùng</option>
              {users.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="notification-type"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Loại thông báo
            </label>
            <select
              id="notification-type"
              value={newNotification.type}
              onChange={(e) => setNewNotification({ ...newNotification, type: e.target.value })}
              className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark py-2 px-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="info">Thông tin</option>
              <option value="warning">Cảnh báo</option>
              <option value="success">Thành công</option>
              {/* <option value="error">Lỗi</option>
              <option value="system">Hệ thống</option>
              <option value="user">Người dùng</option> */}
            </select>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSendNotification}
            disabled={!newNotification.title || !newNotification.message}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={16} className="mr-2" />
            Gửi thông báo
          </button>
        </div>
      </div>
    </div>
  )
}

export default NotificationForm
