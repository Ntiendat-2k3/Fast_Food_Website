"use client"

import { useState } from "react"
import { NavLink, useLocation } from "react-router-dom"
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  MessageSquare,
  PlusCircle,
  List,
  UserCheck,
  Gift,
  LogOut,
  ChevronDown,
  ChevronRight,
  Utensils,
  Star,
  Bell,
  DollarSign,
  Shield,
  Menu,
  X,
} from "lucide-react"

const Sidebar = ({ onLogout, user }) => {
  const location = useLocation()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [expandedMenus, setExpandedMenus] = useState({})

  const toggleMenu = (menuKey) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [menuKey]: !prev[menuKey],
    }))
  }

  const menuItems = [
    {
      key: "dashboard",
      title: "Dashboard",
      icon: LayoutDashboard,
      path: "/",
      color: "from-blue-500 to-blue-600",
    },
    {
      key: "products",
      title: "Sản phẩm",
      icon: Package,
      color: "from-green-500 to-green-600",
      submenu: [
        { title: "Thêm sản phẩm", path: "/add", icon: PlusCircle },
        { title: "Danh sách", path: "/list", icon: List },
        { title: "Danh mục", path: "/categories", icon: Utensils },
      ],
    },
    {
      key: "orders",
      title: "Đơn hàng",
      icon: ShoppingCart,
      path: "/orders",
      color: "from-orange-500 to-orange-600",
    },
    {
      key: "customers",
      title: "Khách hàng",
      icon: Users,
      path: "/customers",
      color: "from-purple-500 to-purple-600",
    },
    {
      key: "revenue",
      title: "Doanh thu",
      icon: DollarSign,
      path: "/revenue",
      color: "from-emerald-500 to-emerald-600",
    },
    {
      key: "vouchers",
      title: "Voucher",
      icon: Gift,
      path: "/vouchers",
      color: "from-pink-500 to-pink-600",
    },
    {
      key: "staff",
      title: "Nhân viên",
      icon: UserCheck,
      path: "/staff",
      color: "from-indigo-500 to-indigo-600",
      adminOnly: true,
    },
    {
      key: "communication",
      title: "Giao tiếp",
      icon: MessageSquare,
      color: "from-cyan-500 to-cyan-600",
      submenu: [
        { title: "Chat", path: "/chat", icon: MessageSquare },
        { title: "Bình luận", path: "/comments", icon: Star },
        { title: "Thông báo", path: "/notifications", icon: Bell },
      ],
    },
  ]

  const filteredMenuItems = menuItems.filter((item) => {
    if (item.adminOnly && user?.role !== "admin") {
      return false
    }
    return true
  })

  const isActive = (path) => {
    if (path === "/") {
      return location.pathname === "/"
    }
    return location.pathname.startsWith(path)
  }

  const handleLogout = () => {
    if (window.confirm("Bạn có chắc chắn muốn đăng xuất?")) {
      onLogout()
    }
  }

  return (
    <>
      {/* Mobile Overlay */}
      {!isCollapsed && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsCollapsed(true)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 border-r border-gray-700/50 transition-all duration-300 z-50 ${
          isCollapsed ? "-translate-x-full lg:translate-x-0 lg:w-20" : "w-80 lg:w-64"
        }`}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-700/50">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center shadow-lg">
                  <Shield className="w-6 h-6 text-black" />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent">
                    Admin Panel
                  </h1>
                  <p className="text-xs text-gray-400">Quản lý hệ thống</p>
                </div>
              </div>
            )}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 rounded-lg hover:bg-gray-700/50 text-gray-400 hover:text-white transition-colors lg:hidden"
            >
              {isCollapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
            </button>
          </div>

          {/* User Info */}
          {!isCollapsed && user && (
            <div className="mt-4 p-3 rounded-xl bg-gray-800/50 border border-gray-700/30">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">{user.name?.charAt(0).toUpperCase() || "A"}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{user.name || "Admin"}</p>
                  <p className="text-xs text-gray-400 capitalize">{user.role || "admin"}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-4 px-3">
          <nav className="space-y-2">
            {filteredMenuItems.map((item) => (
              <div key={item.key}>
                {item.submenu ? (
                  <div>
                    <button
                      onClick={() => toggleMenu(item.key)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-gray-300 hover:bg-gray-700/50 hover:text-white transition-all duration-300 ${
                        isCollapsed ? "justify-center" : ""
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br ${item.color}`}
                      >
                        <item.icon className="w-5 h-5 text-white" />
                      </div>
                      {!isCollapsed && (
                        <>
                          <span className="font-medium flex-1 text-left">{item.title}</span>
                          {expandedMenus[item.key] ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </>
                      )}
                    </button>

                    {!isCollapsed && expandedMenus[item.key] && (
                      <div className="ml-6 mt-2 space-y-1">
                        {item.submenu.map((subItem) => (
                          <NavLink
                            key={subItem.path}
                            to={subItem.path}
                            className={({ isActive }) =>
                              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-300 ${
                                isActive
                                  ? "bg-yellow-500/20 text-yellow-400 border-l-2 border-yellow-400"
                                  : "text-gray-400 hover:bg-gray-700/30 hover:text-white"
                              }`
                            }
                          >
                            <subItem.icon className="w-4 h-4" />
                            <span>{subItem.title}</span>
                          </NavLink>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-300 ${
                        isActive
                          ? "bg-yellow-500/20 text-yellow-400 shadow-lg shadow-yellow-500/10"
                          : "text-gray-300 hover:bg-gray-700/50 hover:text-white"
                      } ${isCollapsed ? "justify-center" : ""}`
                    }
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br ${item.color}`}
                    >
                      <item.icon className="w-5 h-5 text-white" />
                    </div>
                    {!isCollapsed && <span className="font-medium">{item.title}</span>}
                  </NavLink>
                )}
              </div>
            ))}
          </nav>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700/50">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-gray-300 hover:bg-red-500/20 hover:text-red-400 transition-all duration-300 ${
              isCollapsed ? "justify-center" : ""
            }`}
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br from-red-500 to-red-600">
              <LogOut className="w-5 h-5 text-white" />
            </div>
            {!isCollapsed && <span className="font-medium">Đăng xuất</span>}
          </button>
        </div>
      </div>

      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsCollapsed(false)}
        className="fixed top-4 left-4 z-40 p-2 rounded-lg bg-gray-900 text-white shadow-lg lg:hidden"
      >
        <Menu className="w-5 h-5" />
      </button>
    </>
  )
}

export default Sidebar
