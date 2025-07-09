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
  Moon,
  Sun,
  Plus,
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
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-3 bg-white dark:bg-dark shadow-md md:hidden">
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none"
        >
          <Menu size={22} />
        </button>
        <div className="flex items-center space-x-3">
          <NotificationBell url={url} />
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-md text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 focus:outline-none"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>

      {/* Sidebar for mobile */}
      <div
        className={`fixed inset-0 z-50 md:hidden ${
          isOpen ? "block" : "hidden"
        } bg-gray-900 bg-opacity-50 transition-opacity duration-300`}
        onClick={closeSidebar}
      ></div>

      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-white dark:bg-dark-light shadow-xl transform transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
          <Link
            to={currentUserRole === "admin" ? "/revenue" : "/orders"}
            className="flex items-center space-x-2"
            onClick={closeSidebar}
          >
            <img src="/logo.png" alt="Logo" className="h-7 w-auto" />
            <div className="flex flex-col">
              <span className="text-lg font-bold text-primary">{currentUserRole === "admin" ? "Admin" : "Staff"}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">{currentUserRole}</span>
            </div>
          </Link>
          <div className="flex items-center space-x-2">
            <div className="hidden md:block">
              <NotificationBell url={url} />
            </div>
            <button
              onClick={closeSidebar}
              className="p-1.5 rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 md:hidden focus:outline-none"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <nav className="mt-4 px-3 max-h-[calc(100vh-120px)] overflow-y-auto">
          <ul className="space-y-1.5">
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center px-3 py-2.5 rounded-lg transition-colors ${
                    isActive(item.path)
                      ? "bg-primary text-white"
                      : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                  onClick={closeSidebar}
                >
                  {item.icon}
                  <span className="ml-3 text-sm">{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="absolute bottom-0 w-full p-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <button
              onClick={toggleTheme}
              className="flex items-center px-3 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-sm"
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
              <span className="ml-3">{theme === "dark" ? "Sáng" : "Tối"}</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center px-3 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
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
