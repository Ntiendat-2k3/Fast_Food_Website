import { Users, UserCheck, UserX } from "lucide-react"

const StaffStats = ({ total, active, inactive }) => {
  const stats = [
    {
      title: "Tổng nhân viên",
      value: total,
      icon: Users,
      color: "bg-blue-500",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
      textColor: "text-blue-600 dark:text-blue-400",
    },
    {
      title: "Đang hoạt động",
      value: active,
      icon: UserCheck,
      color: "bg-green-500",
      bgColor: "bg-green-100 dark:bg-green-900/20",
      textColor: "text-green-600 dark:text-green-400",
    },
    {
      title: "Không hoạt động",
      value: inactive,
      icon: UserX,
      color: "bg-red-500",
      bgColor: "bg-red-100 dark:bg-red-900/20",
      textColor: "text-red-600 dark:text-red-400",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <div key={index} className={`${stat.bgColor} rounded-xl p-4 border border-gray-200 dark:border-dark-border`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.title}</p>
                <p className={`text-2xl font-bold ${stat.textColor}`}>{stat.value}</p>
              </div>
              <div className={`p-3 ${stat.color} rounded-lg`}>
                <Icon size={20} className="text-white" />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default StaffStats
