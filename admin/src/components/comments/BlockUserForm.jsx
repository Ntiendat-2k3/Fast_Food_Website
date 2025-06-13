"use client"
import { Shield } from "lucide-react"

const BlockUserForm = ({ blockUserForm, setBlockUserForm, handleBlockUser, users, handleUserSelect }) => {
  return (
    <div className="bg-white dark:bg-dark-lighter rounded-xl shadow-sm p-4 sm:p-6">
      <h2 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-white mb-4 sm:mb-6 flex items-center">
        <Shield className="mr-2" size={20} />
        Chặn người dùng
      </h2>

      <div className="space-y-4">
        <div>
          <label htmlFor="block-user" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Chọn người dùng
          </label>
          <select
            id="block-user"
            value={blockUserForm.userId}
            onChange={handleUserSelect}
            className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark py-2 px-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          >
            <option value="">-- Chọn người dùng --</option>
            {users.map((user) => (
              <option key={user._id} value={user._id}>
                {user.name} ({user.email})
              </option>
            ))}
          </select>
          {blockUserForm.userId && (
            <p className="mt-1 text-xs text-green-600">
              Đã chọn: {users.find((u) => u._id === blockUserForm.userId)?.name || "Người dùng không xác định"}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="block-reason" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Lý do chặn
          </label>
          <textarea
            id="block-reason"
            value={blockUserForm.reason}
            onChange={(e) => setBlockUserForm({ ...blockUserForm, reason: e.target.value })}
            placeholder="Nhập lý do chặn người dùng"
            rows={3}
            className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark py-2 px-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          />
        </div>

        <div className="pt-2">
          <button
            onClick={handleBlockUser}
            disabled={!blockUserForm.userId || !blockUserForm.reason}
            className={`w-full px-4 py-2 rounded-lg flex items-center justify-center text-sm ${
              !blockUserForm.userId || !blockUserForm.reason
                ? "bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed"
                : "bg-red-600 text-white hover:bg-red-700"
            }`}
          >
            <Shield size={16} className="mr-2" />
            Chặn người dùng
          </button>
        </div>
      </div>
    </div>
  )
}

export default BlockUserForm
