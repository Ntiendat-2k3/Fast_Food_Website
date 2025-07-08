"use client"

import { useState } from "react"
import { NavLink, useNavigate } from "react-router-dom"
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Plus,
  Users,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  X,
  Ticket,
  MessageCircle,
  TrendingUp,
} from "lucide-react"

const Sidebar = ({ onLogout, userRole }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const navigate = useNavigate()

  const handleLogout = () => {
    onLogout()
    navigate("/login")
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  // Define menu items based on user role
  const getMenuItems = () => {
    const menuItems = []

    // Admin only items
    if (userRole === "admin") {
      menuItems.push(
        { to: "/revenue", icon: TrendingUp, label: "Doanh thu" },
        { to: "/add", icon: Plus, label: "Thêm sản phẩm" },
        { to: "/profile", icon: Settings, label: "Hồ sơ" },
      )
    }

    // Common items for both admin and staff
    menuItems.push(
      { to: "/orders", icon: ShoppingCart, label: "Đơn hàng" },
      { to: "/list", icon: Package, label: "Danh sách sản phẩm" },
      { to: "/vouchers", icon: Ticket, label: "Mã giảm giá" },
      { to: "/comments", icon: MessageSquare, label: "Quản lý người dùng" },
      { to: "/chat", icon: MessageCircle, label: "Tin nhắn" },
    )

    return menuItems
  }

  const menuItems = getMenuItems()

  const NavItem = ({ to, icon: Icon, label, onClick }) => (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200 rounded-lg mx-2 ${
          isActive ? "bg-orange-600 text-white" : ""
        }`
      }
    >
      <Icon size={20} className="mr-3" />
      <span className="font-medium">{label}</span>
    </NavLink>
  )

  return (
    <>
      {/* Mobile menu button */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-gray-800 border-b border-gray-700 p-4 z-50">
        <div className="flex items-center justify-between">
          <button onClick={toggleMobileMenu} className="text-gray-400 hover:text-white">
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <h1 className="text-xl font-bold text-white">{userRole === "admin" ? "Admin Panel" : "Staff Panel"}</h1>
          <div className="w-6"></div>
        </div>
      </div>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-gray-800 border-r border-gray-700 transform transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 bg-gray-900 border-b border-gray-700">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center mr-3">
                <LayoutDashboard size={20} className="text-white" />
              </div>
              <span className="text-xl font-bold text-white">
                {userRole === "admin" ? "Admin Panel" : "Staff Panel"}
              </span>
            </div>
          </div>

          {/* User info */}
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                <Users size={20} className="text-white" />
              </div>
              <div className="ml-3">
                <p className="text-white font-medium">{userRole === "admin" ? "Quản trị viên" : "Nhân viên"}</p>
                <p className="text-gray-400 text-sm capitalize">{userRole}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 py-4 overflow-y-auto">
            <div className="space-y-1">
              {menuItems.map((item) => (
                <NavItem
                  key={item.to}
                  to={item.to}
                  icon={item.icon}
                  label={item.label}
                  onClick={() => setIsMobileMenuOpen(false)}
                />
              ))}
            </div>
          </nav>

          {/* Logout button */}
          <div className="p-4 border-t border-gray-700">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-3 text-gray-300 hover:bg-red-600 hover:text-white transition-colors duration-200 rounded-lg"
            >
              <LogOut size={20} className="mr-3" />
              <span className="font-medium">Đăng xuất</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}
    </>
  )
}

export default Sidebar
