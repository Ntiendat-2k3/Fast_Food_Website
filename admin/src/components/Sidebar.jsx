"use client"

import { useState } from "react"
import { NavLink, useLocation } from "react-router-dom"
import {
  Home,
  Package,
  ShoppingCart,
  Users,
  MessageCircle,
  BarChart3,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  Plus,
  List,
  Grid3X3,
  UserCheck,
  MessageSquare,
  Gift,
  Bell,
  User,
  LogOut,
  ChevronLeft,
} from "lucide-react"

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [expandedMenus, setExpandedMenus] = useState({})
  const location = useLocation()

  const menuItems = [
    {
      id: "dashboard",
      title: "Tổng quan",
      icon: Home,
      path: "/",
      color: "from-blue-500 to-blue-600",
    },
    {
      id: "products",
      title: "Sản phẩm",
      icon: Package,
      color: "from-green-500 to-green-600",
      submenu: [
        { title: "Thêm sản phẩm", path: "/add", icon: Plus },
        { title: "Danh sách", path: "/list", icon: List },
        { title: "Danh mục", path: "/categories", icon: Grid3X3 },
      ],
    },
    {
      id: "orders",
      title: "Đơn hàng",
      icon: ShoppingCart,
      path: "/orders",
      color: "from-amber-500 to-yellow-500",
      badge: "12",
    },
    {
      id: "customers",
      title: "Khách hàng",
      icon: Users,
      color: "from-purple-500 to-purple-600",
      submenu: [
        { title: "Danh sách KH", path: "/customers", icon: Users }, // New: Customer List
        { title: "Nhân viên", path: "/staff", icon: UserCheck },
      ],
    },
    {
      id: "communication",
      title: "Giao tiếp",
      icon: MessageCircle,
      color: "from-pink-500 to-pink-600",
      submenu: [
        { title: "Tin nhắn", path: "/chat", icon: MessageSquare },
        { title: "Bình luận", path: "/comments", icon: MessageCircle },
      ],
    },
    {
      id: "marketing",
      title: "Marketing",
      icon: Gift,
      color: "from-indigo-500 to-indigo-600",
      submenu: [
        { title: "Voucher", path: "/vouchers", icon: Gift },
        { title: "Thông báo", path: "/notifications", icon: Bell }, // Moved: Notifications
      ],
    },
    {
      id: "reports",
      title: "Báo cáo",
      icon: BarChart3,
      path: "/revenue",
      color: "from-red-500 to-red-600",
    },
    {
      id: "profile",
      title: "Hồ sơ",
      icon: User,
      path: "/profile",
      color: "from-gray-500 to-gray-600",
    },
  ]

  const toggleMenu = (menuId) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [menuId]: !prev[menuId],
    }))
  }

  const isActiveMenu = (item) => {
    if (item.path) {
      return location.pathname === item.path
    }
    if (item.submenu) {
      return item.submenu.some((sub) => location.pathname === sub.path)
    }
    return false
  }

  const isActiveSubmenu = (path) => {
    return location.pathname === path
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-700/50">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-xl flex items-center justify-center">
                <Package className="w-6 h-6 text-black" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">FastFood</h2>
                <p className="text-xs text-gray-400">Admin Panel</p>
              </div>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg bg-gray-800/50 border border-gray-600 text-gray-400 hover:text-amber-400 hover:border-amber-400/50 transition-all duration-300"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => (
          <div key={item.id}>
            {item.submenu ? (
              <div>
                <button
                  onClick={() => toggleMenu(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-300 group ${
                    isActiveMenu(item)
                      ? "bg-gradient-to-r from-amber-400/20 to-yellow-500/20 border border-amber-400/30 text-amber-400"
                      : "text-gray-300 hover:bg-gray-800/50 hover:text-white"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br ${item.color} ${
                      isCollapsed ? "w-6 h-6" : ""
                    }`}
                  >
                    <item.icon className={`text-white ${isCollapsed ? "w-4 h-4" : "w-5 h-5"}`} />
                  </div>
                  {!isCollapsed && (
                    <>
                      <span className="flex-1 text-left font-medium">{item.title}</span>
                      {item.badge && (
                        <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full">{item.badge}</span>
                      )}
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-300 ${
                          expandedMenus[item.id] ? "rotate-180" : ""
                        }`}
                      />
                    </>
                  )}
                </button>
                {!isCollapsed && expandedMenus[item.id] && (
                  <div className="ml-6 mt-2 space-y-1">
                    {item.submenu.map((subItem) => (
                      <NavLink
                        key={subItem.path}
                        to={subItem.path}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-300 ${
                          isActiveSubmenu(subItem.path)
                            ? "bg-amber-400/10 text-amber-400 border-l-2 border-amber-400"
                            : "text-gray-400 hover:bg-gray-800/30 hover:text-white"
                        }`}
                      >
                        <subItem.icon className="w-4 h-4" />
                        <span className="text-sm">{subItem.title}</span>
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <NavLink
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-300 group ${
                  isActiveMenu(item)
                    ? "bg-gradient-to-r from-amber-400/20 to-yellow-500/20 border border-amber-400/30 text-amber-400"
                    : "text-gray-300 hover:bg-gray-800/50 hover:text-white"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br ${item.color} ${
                    isCollapsed ? "w-6 h-6" : ""
                  }`}
                >
                  <item.icon className={`text-white ${isCollapsed ? "w-4 h-4" : "w-5 h-5"}`} />
                </div>
                {!isCollapsed && (
                  <>
                    <span className="flex-1 font-medium">{item.title}</span>
                    {item.badge && (
                      <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full">{item.badge}</span>
                    )}
                  </>
                )}
              </NavLink>
            )}
          </div>
        ))}
      </nav>

      {/* Footer */}
      {!isCollapsed && (
        <div className="p-4 border-t border-gray-700/50">
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-gray-300 hover:bg-red-500/20 hover:text-red-400 transition-all duration-300">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br from-red-500 to-red-600">
              <LogOut className="w-5 h-5 text-white" />
            </div>
            <span className="font-medium">Đăng xuất</span>
          </button>
        </div>
      )}
    </div>
  )

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full bg-gradient-to-b from-gray-900 via-black to-gray-900 border-r border-gray-700/50 backdrop-blur-xl z-50 transition-all duration-300 ${
          isCollapsed ? "w-20" : "w-64"
        } ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        {/* Mobile Close Button */}
        <button
          onClick={() => setIsMobileOpen(false)}
          className="absolute top-4 right-4 lg:hidden p-2 text-gray-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <SidebarContent />
      </div>

      {/* Main Content Spacer */}
      <div className={`${isCollapsed ? "lg:ml-20" : "lg:ml-64"} transition-all duration-300`} />
    </>
  )
}

export default Sidebar
