"use client"
import Pagination from "../../components/Pagination"

const BlacklistTable = ({
  blacklistLoading,
  currentBlacklist,
  handleUnblockUser,
  formatDate,
  blacklistPage,
  totalBlacklistPages,
  handleBlacklistPageChange,
}) => {
  if (blacklistLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (currentBlacklist.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 dark:bg-dark rounded-lg">
        <Shield size={40} className="mx-auto mb-3 text-gray-400" />
        <p className="text-gray-500 dark:text-gray-400">Không có người dùng nào bị chặn</p>
      </div>
    )
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th
                scope="col"
                className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Người dùng
              </th>
              <th
                scope="col"
                className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden sm:table-cell"
              >
                Lý do
              </th>
              <th
                scope="col"
                className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden md:table-cell"
              >
                Ngày chặn
              </th>
              <th
                scope="col"
                className="px-3 sm:px-6 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {currentBlacklist.map((user) => (
              <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td className="px-3 sm:px-6 py-3 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                      <span className="text-gray-700 dark:text-gray-200 font-medium">
                        {user.userName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{user.userName}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[120px] sm:max-w-none">
                        {user.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-3 sm:px-6 py-3 hidden sm:table-cell">
                  <div className="text-xs sm:text-sm text-gray-900 dark:text-white line-clamp-2">{user.reason}</div>
                </td>
                <td className="px-3 sm:px-6 py-3 whitespace-nowrap text-xs sm:text-sm text-gray-500 dark:text-gray-400 hidden md:table-cell">
                  {formatDate(user.blockedAt)}
                </td>
                <td className="px-3 sm:px-6 py-3 whitespace-nowrap text-right text-xs sm:text-sm font-medium">
                  <button onClick={() => handleUnblockUser(user._id)} className="text-primary hover:text-primary-dark">
                    Bỏ chặn
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalBlacklistPages > 1 && (
        <div className="mt-4">
          <Pagination
            currentPage={blacklistPage}
            totalPages={totalBlacklistPages}
            onPageChange={handleBlacklistPageChange}
          />
        </div>
      )}
    </div>
  )
}

// Add the Shield component for the empty state
import { Shield } from "lucide-react"

export default BlacklistTable
