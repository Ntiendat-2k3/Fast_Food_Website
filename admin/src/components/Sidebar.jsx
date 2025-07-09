"use client"

import { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import {
  Package,
  ShoppingCart,
  User,
  LogOut,
  Menu,
  X,
  PieChart,
  Tag,
  MessageSquare,
  Plus,
  Crown,
  Sparkles,
} from "lucide-react"
import { useTheme } from "../context/ThemeContext"

// Lazy load NotificationBell with error boundary
const NotificationBell = ({ url }) => {
  try {
    const NotificationBellComponent = require("./notifications/NotificationBell").default
    return <NotificationBellComponent url={url} />
  } catch (error) {
    console.error("Error loading NotificationBell:", error)
    return null
  }
}

const Sidebar = ({ onLogout, userRole }) => {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()
  const url = "http://localhost:4000"

  // Get user role from props or localStorage as fallback
  const getCurrentUserRole = () => {
    if (userRole) return userRole

    try {
      const userData = localStorage.getItem("user") || sessionStorage.getItem("user")
      if (userData) {
        const user = JSON.parse(userData)
        return user.role
      }
    } catch (error) {
      console.error("Error parsing user data:", error)
    }
    return "staff" // Default to staff if no role found
  }

  const currentUserRole = getCurrentUserRole()
  console.log("Sidebar - Current user role:", currentUserRole)

  const toggleSidebar = () => {
    setIsOpen(!isOpen)
  }

  const closeSidebar = () => {
    setIsOpen(false)
  }

  const handleLogout = () => {
    if (onLogout) {
      onLogout()
    }
    navigate("/login")
  }

  const isActive = (path) => {
    return location.pathname === path
  }

  // Define menu items based on role
  const getMenuItems = () => {
    const baseItems = [
      {
        path: "/orders",
        name: "Đơn hàng",
        icon: <ShoppingCart size={20} />,
        roles: ["admin", "staff"],
      },
      {
        path: "/list",
        name: "Sản phẩm",
        icon: <Package size={20} />,
        roles: ["admin", "staff"], // Staff can view but not modify
      },
      {
        path: "/vouchers",
        name: "Mã giảm giá",
        icon: <Tag size={20} />,
        roles: ["admin", "staff"],
      },
      {
        path: "/comments",
        name: "Quản lý người dùng",
        icon: <MessageSquare size={20} />,
        roles: ["admin", "staff"],
      },
      {
        path: "/profile",
        name: "Hồ sơ",
        icon: <User size={20} />,
        roles: ["admin", "staff"],
      },
      {
        path: "/chat",
        name: "Quản lý tin nhắn",
        icon: <MessageSquare size={20} />,
        roles: ["admin", "staff"],
      },
    ]

    // Admin-only items
    const adminOnlyItems = [
      {
        path: "/revenue",
        name: "Doanh thu",
        icon: <PieChart size={20} />,
        roles: ["admin"],
      },
      {
        path: "/add",
        name: "Thêm sản phẩm",
        icon: <Plus size={20} />,
        roles: ["admin"],
      },
    ]

    // Combine items and filter by role
    const allItems = [...adminOnlyItems, ...baseItems]
    const filteredItems = allItems.filter((item) => item.roles.includes(currentUserRole))

    console.log(
      "Filtered menu items for role",
      currentUserRole,
      ":",
      filteredItems.map((item) => item.name),
    )

    return filteredItems
  }

  const menuItems = getMenuItems()

  return (
    <>
      {/* Mobile menu button */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 bg-dark-card border-b border-dark-border shadow-dark-lg md:hidden">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-xl text-golden-400 hover:bg-dark-lighter hover:shadow-golden/20 focus:outline-none transition-all duration-300"
        >
          <Menu size={22} />
        </button>
        <div className="flex items-center space-x-3">
          <NotificationBell url={url} />
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-golden-400 hover:bg-dark-lighter hover:shadow-golden/20 focus:outline-none transition-all duration-300"
          >
            <Sparkles size={18} />
          </button>
          <button
            onClick={handleLogout}
            className="p-2 rounded-xl text-red-400 hover:bg-red-900/20 hover:shadow-red-500/20 focus:outline-none transition-all duration-300"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>

      {/* Sidebar overlay for mobile */}
      <div
        className={`fixed inset-0 z-50 md:hidden ${
          isOpen ? "block" : "hidden"
        } bg-black/80 backdrop-blur-sm transition-opacity duration-300`}
        onClick={closeSidebar}
      ></div>

      <aside
        className={`fixed top-0 left-0 z-50 h-full w-72 bg-gradient-to-b from-dark to-dark-light shadow-2xl transform transition-transform duration-300 ease-in-out md:translate-x-0 border-r border-dark-border ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-dark-border bg-dark-card">
          <Link
            to={currentUserRole === "admin" ? "/revenue" : "/orders"}
            className="flex items-center space-x-3 hover:scale-105 transition-transform duration-300"
            onClick={closeSidebar}
          >
            <div className="relative">
              <img src="/logo.png" alt="Logo" className="h-10 w-auto" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-golden rounded-full animate-pulse"></div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold bg-gradient-golden bg-clip-text text-transparent">
                {currentUserRole === "admin" ? "Admin Panel" : "Staff Panel"}
              </span>
              <div className="flex items-center space-x-2">
                {currentUserRole === "admin" && <Crown size={12} className="text-golden-400" />}
                <span className="text-sm text-golden-400 capitalize font-medium">{currentUserRole}</span>
              </div>
            </div>
          </Link>
          <div className="flex items-center space-x-2">
            <div className="hidden md:block">
              <NotificationBell url={url} />
            </div>
            <button
              onClick={closeSidebar}
              className="p-2 rounded-xl text-gray-400 hover:bg-dark-lighter hover:text-golden-400 md:hidden focus:outline-none transition-all duration-300"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-4 max-h-[calc(100vh-200px)] overflow-y-auto scrollbar-golden">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`sidebar-item ${isActive(item.path) ? "active" : "text-gray-300 hover:text-golden-400"}`}
                  onClick={closeSidebar}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`p-2 rounded-lg ${
                        isActive(item.path) ? "bg-white/20" : "bg-dark-lighter group-hover:bg-golden-500/20"
                      } transition-all duration-300`}
                    >
                      {item.icon}
                    </div>
                    <span className="font-medium">{item.name}</span>
                  </div>
                  {isActive(item.path) && (
                    <div className="ml-auto">
                      <Sparkles size={16} className="text-white animate-pulse" />
                    </div>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 w-full p-4 border-t border-dark-border bg-dark-card">
          <div className="flex items-center justify-between">
            <button
              onClick={toggleTheme}
              className="flex items-center space-x-3 px-4 py-3 text-golden-400 hover:bg-dark-lighter rounded-xl transition-all duration-300 hover:shadow-golden/20"
            >
              <Sparkles size={18} />
              <span className="font-medium">Golden Theme</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center justify-center p-3 text-red-400 hover:bg-red-900/20 rounded-xl transition-all duration-300 hover:shadow-red-500/20"
              title="Đăng xuất"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
