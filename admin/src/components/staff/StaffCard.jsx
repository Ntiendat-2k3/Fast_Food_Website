// "use client"

// import { Eye, Edit, Trash2, UserCheck, UserX, Phone, Mail, MapPin, Calendar, MoreVertical } from "lucide-react"
// import { useState } from "react"

// const StaffCard = ({ staff, loading, onEdit, onView, onDelete, onStatusToggle }) => {
//   const [activeDropdown, setActiveDropdown] = useState(null)

//   if (loading) {
//     return (
//       <div className="p-6">
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//           {[...Array(8)].map((_, i) => (
//             <div key={i} className="bg-gray-100 dark:bg-gray-700 rounded-2xl p-6 animate-pulse">
//               <div className="flex items-center space-x-4 mb-4">
//                 <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded-full"></div>
//                 <div className="flex-1">
//                   <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
//                   <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-1/2"></div>
//                 </div>
//               </div>
//               <div className="space-y-2">
//                 <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded"></div>
//                 <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-2/3"></div>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     )
//   }

//   if (staff.length === 0) {
//     return (
//       <div className="p-12 text-center">
//         <div className="w-24 h-24 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
//           <UserCheck size={40} className="text-blue-500" />
//         </div>
//         <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Chưa có nhân viên</h3>
//         <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
//           Thêm nhân viên đầu tiên để bắt đầu quản lý đội ngũ của bạn.
//         </p>
//       </div>
//     )
//   }

//   return (
//     <div className="p-6">
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//         {staff.map((member) => (
//           <div
//             key={member._id}
//             className="group bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl hover:shadow-blue-500/10 dark:hover:shadow-blue-500/5 transition-all duration-300 transform hover:-translate-y-1"
//           >
//             {/* Header */}
//             <div className="flex items-start justify-between mb-4">
//               <div className="flex items-center space-x-3">
//                 <div className="relative">
//                   <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
//                     <span className="text-white font-bold text-lg">{member.name.charAt(0).toUpperCase()}</span>
//                   </div>
//                   <div
//                     className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-gray-800 ${
//                       member.isActive ? "bg-green-500" : "bg-red-500"
//                     }`}
//                   ></div>
//                 </div>
//                 <div className="flex-1 min-w-0">
//                   <h3 className="font-semibold text-gray-900 dark:text-white truncate">{member.name}</h3>
//                   <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{member.position || "Nhân viên"}</p>
//                 </div>
//               </div>

//               {/* Dropdown Menu */}
//               <div className="relative">
//                 <button
//                   onClick={() => setActiveDropdown(activeDropdown === member._id ? null : member._id)}
//                   className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors opacity-0 group-hover:opacity-100"
//                 >
//                   <MoreVertical size={16} className="text-gray-400" />
//                 </button>

//                 {activeDropdown === member._id && (
//                   <div className="absolute right-0 top-8 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-10">
//                     <button
//                       onClick={() => {
//                         onView(member)
//                         setActiveDropdown(null)
//                       }}
//                       className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-2"
//                     >
//                       <Eye size={14} />
//                       <span>Xem chi tiết</span>
//                     </button>
//                     <button
//                       onClick={() => {
//                         onEdit(member)
//                         setActiveDropdown(null)
//                       }}
//                       className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-2"
//                     >
//                       <Edit size={14} />
//                       <span>Chỉnh sửa</span>
//                     </button>
//                     <button
//                       onClick={() => {
//                         onStatusToggle(member._id, member.isActive)
//                         setActiveDropdown(null)
//                       }}
//                       className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-2"
//                     >
//                       {member.isActive ? <UserX size={14} /> : <UserCheck size={14} />}
//                       <span>{member.isActive ? "Vô hiệu hóa" : "Kích hoạt"}</span>
//                     </button>
//                     <hr className="my-1 border-gray-200 dark:border-gray-700" />
//                     <button
//                       onClick={() => {
//                         onDelete(member)
//                         setActiveDropdown(null)
//                       }}
//                       className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center space-x-2"
//                     >
//                       <Trash2 size={14} />
//                       <span>Xóa</span>
//                     </button>
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* Contact Info */}
//             <div className="space-y-2 mb-4">
//               <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
//                 <Mail size={14} />
//                 <span className="truncate">{member.email}</span>
//               </div>
//               {member.phone && (
//                 <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
//                   <Phone size={14} />
//                   <span>{member.phone}</span>
//                 </div>
//               )}
//               {member.address && (
//                 <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
//                   <MapPin size={14} />
//                   <span className="truncate">{member.address}</span>
//                 </div>
//               )}
//             </div>

//             {/* Status & Date */}
//             <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
//               <div
//                 className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
//                   member.isActive
//                     ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
//                     : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
//                 }`}
//               >
//                 {member.isActive ? (
//                   <>
//                     <UserCheck size={12} className="mr-1" />
//                     Hoạt động
//                   </>
//                 ) : (
//                   <>
//                     <UserX size={12} className="mr-1" />
//                     Tạm dừng
//                   </>
//                 )}
//               </div>
//               <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
//                 <Calendar size={12} className="mr-1" />
//                 {new Date(member.createdAt).toLocaleDateString("vi-VN")}
//               </div>
//             </div>

//             {/* Quick Actions */}
//             <div className="flex items-center space-x-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
//               <button
//                 onClick={() => onView(member)}
//                 className="flex-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 py-2 px-3 rounded-lg text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
//               >
//                 Xem
//               </button>
//               <button
//                 onClick={() => onEdit(member)}
//                 className="flex-1 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 py-2 px-3 rounded-lg text-sm font-medium hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
//               >
//                 Sửa
//               </button>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   )
// }

// export default StaffCard
