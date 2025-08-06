import { Eye, Edit, Trash2, UserCheck, UserX, Phone, Mail, MapPin, Briefcase } from 'lucide-react'

const StaffTable = ({ staff, loading, onEdit, onView, onDelete, onStatusToggle }) => {
  if (loading) {
    return (
      <div className="bg-white dark:bg-dark-light rounded-xl p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex space-x-4">
              <div className="rounded-full bg-gray-200 dark:bg-dark-lighter h-10 w-10"></div>
              <div className="flex-1 space-y-2 py-1">
                <div className="h-4 bg-gray-200 dark:bg-dark-lighter rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 dark:bg-dark-lighter rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (staff.length === 0) {
    return (
      <div className="bg-white dark:bg-dark-light rounded-xl p-8 text-center">
        <div className="w-16 h-16 bg-gray-100 dark:bg-dark-lighter rounded-full flex items-center justify-center mx-auto mb-4">
          <UserCheck size={32} className="text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Chưa có nhân viên</h3>
        <p className="text-gray-500 dark:text-gray-400">Thêm nhân viên đầu tiên để bắt đầu quản lý.</p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-dark-light rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-dark-lighter">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Nhân viên
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Liên hệ
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Vị trí
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Trạng thái
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Ngày tạo
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-dark-light divide-y divide-gray-200 dark:divide-dark-border">
            {staff.map((member) => (
              <tr key={member._id} className="hover:bg-gray-50 dark:hover:bg-dark-lighter transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      {member.avatar ? (
                        <img
                          src={`${import.meta.env.VITE_API_URL}/images/${member.avatar}`}
                          alt={member.name}
                          className="h-10 w-10 rounded-full object-cover border-2 border-golden-200"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gradient-golden flex items-center justify-center">
                          <span className="text-white font-medium text-sm">{member.name.charAt(0).toUpperCase()}</span>
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{member.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                        <Mail size={12} className="mr-1" />
                        {member.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-white">
                    {member.phone && (
                      <div className="flex items-center mb-1">
                        <Phone size={12} className="mr-1 text-gray-400" />
                        {member.phone}
                      </div>
                    )}
                    {member.address && (
                      <div className="flex items-center text-gray-500 dark:text-gray-400">
                        <MapPin size={12} className="mr-1" />
                        <span className="truncate max-w-32">{member.address}</span>
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-gray-900 dark:text-white">
                    <Briefcase size={12} className="mr-1 text-gray-400" />
                    {member.position || "Nhân viên"}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => onStatusToggle(member._id, member.isActive)}
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${
                      member.isActive
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-800"
                        : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-800"
                    }`}
                  >
                    {member.isActive ? (
                      <>
                        <UserCheck size={12} className="mr-1" />
                        Hoạt động
                      </>
                    ) : (
                      <>
                        <UserX size={12} className="mr-1" />
                        Không hoạt động
                      </>
                    )}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {new Date(member.createdAt).toLocaleDateString("vi-VN")}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={() => onView(member)}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1 rounded transition-colors"
                      title="Xem chi tiết"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => onEdit(member)}
                      className="text-golden-600 hover:text-golden-900 dark:text-golden-400 dark:hover:text-golden-300 p-1 rounded transition-colors"
                      title="Chỉnh sửa"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => onDelete(member)}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1 rounded transition-colors"
                      title="Xóa"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default StaffTable
