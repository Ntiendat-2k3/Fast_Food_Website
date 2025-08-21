"use client"

import { useState, useContext, useEffect } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { StoreContext } from "../context/StoreContext"
import { useTheme } from "../context/ThemeContext"
import {
  ShoppingCart,
  User,
  LogOut,
  Package,
  Menu,
  X,
  Sun,
  Moon,
  Bell,
  Heart,
  History,
  KeyRound,
  CheckCheck,
  Home,
  UtensilsCrossed,
} from "lucide-react"
import axios from "axios"
import { motion, AnimatePresence } from "framer-motion"

const Navbar = ({ setShowLogin, setShowChangePasswordModal }) => {
  const [menu, setMenu] = useState("home")
  const { getTotalCartAmount, token, setToken, cartItems, url, user, setUser } = useContext(StoreContext)
  const { darkMode, toggleDarkMode } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [wishlistCount, setWishlistCount] = useState(0)
  const [loadingNotifications, setLoadingNotifications] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0) // Declare unreadCount variable

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownOpen && !event.target.closest(".user-dropdown")) {
        setDropdownOpen(false)
      }
      if (notificationsOpen && !event.target.closest(".notifications-dropdown")) {
        setNotificationsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [dropdownOpen, notificationsOpen])

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!token) {
      return
    }

    setLoadingNotifications(true)
    try {
      const response = await axios.get(`${url}/api/notification/list?page=1&limit=20`, {
        headers: { token },
      })

      if (response.data.success) {
        const adminNotifications = (response.data.data || []).filter(
          (notification) => notification.createdBy === "admin",
        )

        setNotifications(adminNotifications)
        const unread = adminNotifications.filter((notification) => !notification.read && !notification.isRead).length
        setUnreadCount(unread)
      } else {
        console.error("Failed to fetch notifications:", response.data.message)
        setNotifications([])
        setUnreadCount(0)
      }
    } catch (error) {
      console.error("Error fetching notifications:", error)
      if (error.response) {
        console.error("Error response:", error.response.data)
      }
      setNotifications([])
      setUnreadCount(0)
    } finally {
      setLoadingNotifications(false)
    }
  }

  // Fetch unread count
  const fetchUnreadCount = async () => {
    if (!token) {
      return
    }

    try {
      const response = await axios.get(`${url}/api/notification/unread-count`, {
        headers: { token },
      })

      if (response.data.success) {
        setUnreadCount(response.data.data.count || 0)
      } else {
        console.error("Failed to fetch unread count:", response.data.message)
        setUnreadCount(0)
      }
    } catch (error) {
      console.error("Error fetching unread count:", error)
      if (error.response) {
        console.error("Error response:", error.response.data)
      }
      setUnreadCount(0)
    }
  }

  // Fetch notifications when component mounts and token changes
  useEffect(() => {
    if (token && user) {
      fetchNotifications()
      fetchUnreadCount()

      const intervalId = setInterval(() => {
        fetchNotifications()
        fetchUnreadCount()
      }, 30000)

      return () => {
        clearInterval(intervalId)
      }
    } else {
      setNotifications([])
      setUnreadCount(0)
    }
  }, [token, user, url])

  // Fetch wishlist count
  useEffect(() => {
    const fetchWishlistCount = async () => {
      if (!token) return

      try {
        const response = await axios.post(
          `${url}/api/wishlist/get`,
          {},
          {
            headers: { token },
          },
        )

        if (response.data.success) {
          setWishlistCount(response.data.data.length)
        }
      } catch (error) {
        console.error("Error fetching wishlist count:", error)
      }
    }

    if (token) {
      fetchWishlistCount()
    }
  }, [token, url])

  const markAsRead = async (notificationId) => {
    if (!token) return

    try {
      const response = await axios.post(
        `${url}/api/notification/read`,
        { id: notificationId, read: true },
        { headers: { token } },
      )

      if (response.data.success) {
        setNotifications((prevNotifications) =>
          prevNotifications.map((notification) =>
            notification._id === notificationId ? { ...notification, read: true, isRead: true } : notification,
          ),
        )

        setUnreadCount((prev) => Math.max(0, prev - 1))
      } else {
        console.error("Failed to mark notification as read:", response.data.message)
      }
    } catch (error) {
      console.error("Error marking notification as read:", error)
      if (error.response) {
        console.error("Error response:", error.response.data)
      }
    }
  }

  const markAllAsRead = async () => {
    if (!token) return

    try {
      const response = await axios.post(`${url}/api/notification/mark-all-read`, {}, { headers: { token } })

      if (response.data.success) {
        setNotifications((prevNotifications) =>
          prevNotifications.map((notification) => ({ ...notification, read: true, isRead: true })),
        )
        setUnreadCount(0)
      } else {
        console.error("Failed to mark all notifications as read:", response.data.message)
      }
    } catch (error) {
      console.error("Error marking all notifications as read:", error)
      if (error.response) {
        console.error("Error response:", error.response.data)
      }
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    setToken("")
    setUser(null)
    setWishlistCount(0)
    setNotifications([])
    setUnreadCount(0)
    navigate("/")
  }

  const totalItems = Object.values(cartItems).reduce((a, b) => a + b, 0)

  // Get notification type style
  const getNotificationTypeStyle = (type) => {
    switch (type) {
      case "info":
        return "bg-blue-500/20 text-blue-300 border border-blue-500/30"
      case "warning":
        return "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30"
      case "success":
        return "bg-green-500/20 text-green-300 border border-green-500/30"
      case "error":
        return "bg-red-500/20 text-red-300 border border-red-500/30"
      case "order":
        return "bg-purple-500/20 text-purple-300 border border-purple-500/30"
      case "payment":
        return "bg-green-500/20 text-green-300 border border-green-500/30"
      case "system":
        return "bg-gray-500/20 text-gray-300 border border-gray-500/30"
      default:
        return "bg-gray-500/20 text-gray-300 border border-gray-500/30"
    }
  }

  // Get notification type label
  const getNotificationTypeLabel = (type) => {
    switch (type) {
      case "info":
        return "Thông tin"
      case "warning":
        return "Cảnh báo"
      case "success":
        return "Thành công"
      case "error":
        return "Lỗi"
      case "order":
        return "Đơn hàng"
      case "payment":
        return "Thanh toán"
      case "system":
        return "Hệ thống"
      case "user":
        return "Người dùng"
      default:
        return "Khác"
    }
  }

  // Format date
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString)
      const now = new Date()
      const diffInMinutes = Math.floor((now - date) / (1000 * 60))

      if (diffInMinutes < 1) return "Vừa xong"
      if (diffInMinutes < 60) return `${diffInMinutes} phút trước`
      if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} giờ trước`
      return `${Math.floor(diffInMinutes / 1440)} ngày trước`
    } catch (error) {
      return "Không xác định"
    }
  }

  // Navigation items
  const navItems = [
    { path: "/", label: "Trang chủ" },
    { path: "/foods", label: "Thực đơn" },
    { path: "/myorders", label: "Đơn hàng" },
    { path: "/contact", label: "Liên hệ" },
  ]

  // Mobile menu animation variants
  const mobileMenuVariants = {
    closed: {
      opacity: 0,
      height: 0,
      transition: {
        duration: 0.3,
        ease: "easeInOut",
      },
    },
    open: {
      opacity: 1,
      height: "auto",
      transition: {
        duration: 0.3,
        ease: "easeInOut",
      },
    },
  }

  const menuItemVariants = {
    closed: { x: -20, opacity: 0 },
    open: (i) => ({
      x: 0,
      opacity: 1,
      transition: {
        delay: i * 0.1,
        duration: 0.3,
      },
    }),
  }

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-slate-900/95 backdrop-blur-xl shadow-lg border-b border-slate-700"
            : "bg-slate-900/80 backdrop-blur-md"
        }`}
      >
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="bg-gradient-to-r from-primary to-primary-dark p-2 rounded-xl group-hover:scale-110 transition-transform duration-300">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-slate-900"
                >
                  <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                </svg>
              </div>
              <span className="text-xl lg:text-2xl font-bold text-white group-hover:text-primary transition-colors">
                GreenEats
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`font-medium transition-all duration-300 px-3 py-2 rounded-lg hover:bg-slate-800/50 ${
                    location.pathname === item.path ? "text-primary bg-slate-800/30" : "text-white hover:text-primary"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Right Side Icons */}
            <div className="flex items-center space-x-2 lg:space-x-4">
              {/* User Greeting - Show when logged in on desktop */}
              {token && user && (
                <div className="hidden xl:flex items-center mr-2">
                  <span className="text-white font-medium text-sm">
                    Hi, <span className="text-primary">{user.name}</span>
                  </span>
                </div>
              )}

              {/* Theme Toggle - Desktop only */}
              <button
                onClick={toggleDarkMode}
                className="hidden lg:flex p-2 lg:p-3 text-white hover:text-primary transition-colors rounded-lg hover:bg-slate-800/50 min-h-[44px] min-w-[44px] items-center justify-center"
                aria-label={darkMode ? "Chuyển sang chế độ sáng" : "Chuyển sang chế độ tối"}
              >
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              {/* Notifications - Show on both desktop and mobile */}
              {token && (
                <div className="notifications-dropdown relative">
                  <button
                    onClick={() => {
                      setNotificationsOpen(!notificationsOpen)
                      if (!notificationsOpen) {
                        fetchNotifications()
                      }
                    }}
                    className="relative p-2 lg:p-3 text-white hover:text-primary transition-colors rounded-lg hover:bg-slate-800/50 min-h-[44px] min-w-[44px] flex items-center justify-center"
                    aria-expanded={notificationsOpen}
                    aria-haspopup="true"
                  >
                    <Bell size={20} />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </button>
                  <AnimatePresence>
                    {notificationsOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-80 bg-slate-800/95 backdrop-blur-xl rounded-xl shadow-2xl border border-slate-700 py-2 z-10 max-h-96 overflow-hidden"
                      >
                        <div className="px-4 py-3 border-b border-slate-700 flex items-center justify-between">
                          <h3 className="font-medium text-white">Thông báo ({unreadCount})</h3>
                          <div className="flex items-center space-x-2">
                            {unreadCount > 0 && (
                              <button
                                onClick={markAllAsRead}
                                className="text-xs text-primary hover:text-primary/80 flex items-center"
                              >
                                <CheckCheck size={14} className="mr-1" />
                                Đọc tất cả
                              </button>
                            )}
                            {loadingNotifications && (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                            )}
                          </div>
                        </div>
                        <div className="max-h-80 overflow-y-auto">
                          {notifications.length > 0 ? (
                            <div>
                              {notifications.map((notification) => (
                                <div
                                  key={notification._id}
                                  className={`px-4 py-3 border-b border-slate-700 hover:bg-slate-700/50 cursor-pointer transition-colors ${
                                    !notification.read && !notification.isRead ? "bg-blue-500/10" : ""
                                  }`}
                                  onClick={() =>
                                    !notification.read && !notification.isRead && markAsRead(notification._id)
                                  }
                                >
                                  <div className="flex items-center justify-between mb-1">
                                    <h4
                                      className={`font-medium text-sm ${
                                        !notification.read && !notification.isRead ? "text-primary" : "text-white"
                                      }`}
                                    >
                                      {notification.title}
                                    </h4>
                                    <span
                                      className={`text-xs px-2 py-0.5 rounded-full ${getNotificationTypeStyle(
                                        notification.type,
                                      )}`}
                                    >
                                      {getNotificationTypeLabel(notification.type)}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-300 mb-1">{notification.message}</p>
                                  <div className="flex items-center justify-between">
                                    <p className="text-xs text-gray-400">{formatDate(notification.createdAt)}</p>
                                    {notification.createdBy && (
                                      <p className="text-xs text-gray-500">bởi {notification.createdBy}</p>
                                    )}
                                  </div>
                                  {!notification.read && !notification.isRead && (
                                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="px-4 py-6 text-center text-gray-400">
                              <Bell size={24} className="mx-auto mb-2 opacity-50" />
                              <p>Không có thông báo nào</p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Wishlist - Desktop only */}
              {token && (
                <Link
                  to="/wishlist"
                  className="hidden lg:flex relative p-2 lg:p-3 text-white hover:text-primary transition-colors rounded-lg hover:bg-slate-800/50 min-h-[44px] min-w-[44px] items-center justify-center"
                >
                  <Heart size={20} />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                      {wishlistCount > 9 ? "9+" : wishlistCount}
                    </span>
                  )}
                </Link>
              )}

              {/* Cart - Desktop only */}
              <Link
                to="/cart"
                className="hidden lg:flex relative p-2 lg:p-3 text-white hover:text-primary transition-colors rounded-lg hover:bg-slate-800/50 min-h-[44px] min-w-[44px] items-center justify-center"
              >
                <ShoppingCart size={20} />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-slate-900 text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                    {totalItems > 9 ? "9+" : totalItems}
                  </span>
                )}
              </Link>

              {/* Auth Section */}
              {!token ? (
                <button
                  onClick={() => setShowLogin(true)}
                  className="bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-slate-900 font-medium py-2 px-4 lg:py-3 lg:px-6 rounded-xl transition-all duration-300 hover:scale-105 min-h-[44px]"
                >
                  <span className="hidden sm:inline">Đăng nhập</span>
                  <span className="sm:hidden">Login</span>
                </button>
              ) : (
                <div className="user-dropdown relative group">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="p-2 lg:p-3 text-white hover:text-primary transition-colors rounded-lg hover:bg-slate-800/50 min-h-[44px] min-w-[44px] flex items-center justify-center"
                    aria-expanded={dropdownOpen}
                    aria-haspopup="true"
                  >
                    <User size={20} />
                  </button>
                  <AnimatePresence>
                    {dropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-48 bg-slate-800/95 backdrop-blur-xl rounded-xl shadow-2xl border border-slate-700 py-2 z-10"
                      >
                        {/* User name in dropdown */}
                        <div className="px-4 py-3 border-b border-slate-700">
                          <p className="font-medium text-white text-sm">
                            Hi, <span className="text-primary">{user?.name}</span>
                          </p>
                        </div>
                        <Link
                          to="/wishlist"
                          className="block px-4 py-3 text-sm text-white hover:bg-slate-700/50 hover:text-primary flex items-center transition-colors lg:hidden"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <Heart size={16} className="mr-3" />
                          Danh sách yêu thích
                        </Link>
                        <Link
                          to="/myorders"
                          className="block px-4 py-3 text-sm text-white hover:bg-slate-700/50 hover:text-primary flex items-center transition-colors"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <Package size={16} className="mr-3" />
                          Đơn hàng của tôi
                        </Link>
                        <Link
                          to="/purchase-history"
                          className="block px-4 py-3 text-sm text-white hover:bg-slate-700/50 hover:text-primary flex items-center transition-colors"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <History size={16} className="mr-3" />
                          Lịch sử mua hàng
                        </Link>
                        <button
                          onClick={() => {
                            setShowChangePasswordModal(true)
                            setDropdownOpen(false)
                          }}
                          className="block w-full text-left px-4 py-3 text-sm text-white hover:bg-slate-700/50 hover:text-primary flex items-center transition-colors"
                        >
                          <KeyRound size={16} className="mr-3" />
                          Đổi mật khẩu
                        </button>
                        <button
                          onClick={() => {
                            logout()
                            setDropdownOpen(false)
                          }}
                          className="block w-full text-left px-4 py-3 text-sm text-white hover:bg-slate-700/50 hover:text-primary flex items-center transition-colors"
                        >
                          <LogOut size={16} className="mr-3" />
                          Đăng xuất
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-white hover:text-primary transition-colors rounded-lg hover:bg-slate-800/50 min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Toggle mobile menu"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial="closed"
                animate="open"
                exit="closed"
                variants={mobileMenuVariants}
                className="lg:hidden overflow-hidden"
              >
                <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl shadow-xl border border-slate-700 p-4 mt-4 mb-4">
                  {/* User greeting in mobile menu */}
                  {token && user && (
                    <motion.div
                      variants={menuItemVariants}
                      custom={0}
                      className="py-3 px-4 mb-3 border-b border-slate-700"
                    >
                      <p className="font-medium text-white">
                        Hi, <span className="text-primary">{user.name}</span>
                      </p>
                    </motion.div>
                  )}
                  <nav className="flex flex-col space-y-2">
                    {navItems.map((item, index) => (
                      <motion.div key={item.path} variants={menuItemVariants} custom={index + 1}>
                        <Link
                          to={item.path}
                          className={`font-medium transition-all duration-300 py-3 px-4 rounded-lg flex items-center min-h-[48px] ${
                            location.pathname === item.path
                              ? "text-primary bg-slate-700/50"
                              : "text-white hover:text-primary hover:bg-slate-700/30"
                          }`}
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {item.label}
                        </Link>
                      </motion.div>
                    ))}
                    {token && (
                      <>
                        <motion.div variants={menuItemVariants} custom={navItems.length + 2}>
                          <Link
                            to="/myorders"
                            className={`font-medium transition-all duration-300 py-3 px-4 rounded-lg flex items-center min-h-[48px] ${
                              location.pathname === "/myorders"
                                ? "text-primary bg-slate-700/50"
                                : "text-white hover:text-primary hover:bg-slate-700/30"
                            }`}
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <Package size={16} className="mr-3" />
                            Đơn hàng của tôi
                          </Link>
                        </motion.div>
                        <motion.div variants={menuItemVariants} custom={navItems.length + 3}>
                          <Link
                            to="/purchase-history"
                            className={`font-medium transition-all duration-300 py-3 px-4 rounded-lg flex items-center min-h-[48px] ${
                              location.pathname === "/purchase-history"
                                ? "text-primary bg-slate-700/50"
                                : "text-white hover:text-primary hover:bg-slate-700/30"
                            }`}
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <History size={16} className="mr-3" />
                            Lịch sử mua hàng
                          </Link>
                        </motion.div>
                        <motion.div variants={menuItemVariants} custom={navItems.length + 4}>
                          <button
                            onClick={() => {
                              setShowChangePasswordModal(true)
                              setMobileMenuOpen(false)
                            }}
                            className="w-full text-left font-medium transition-all duration-300 py-3 px-4 rounded-lg flex items-center min-h-[48px] text-white hover:text-primary hover:bg-slate-700/30"
                          >
                            <KeyRound size={16} className="mr-3" />
                            Đổi mật khẩu
                          </button>
                        </motion.div>
                      </>
                    )}
                  </nav>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-xl border-t border-slate-700">
        <div className="flex items-center justify-around py-2 px-4">
          {/* Home */}
          <Link
            to="/"
            className={`flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-all duration-300 min-w-[60px] ${
              location.pathname === "/" ? "text-primary" : "text-white hover:text-primary"
            }`}
          >
            <Home size={20} />
            <span className="text-xs mt-1 font-medium">Trang chủ</span>
          </Link>

          {/* Menu */}
          <Link
            to="/foods"
            className={`flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-all duration-300 min-w-[60px] ${
              location.pathname === "/foods" ? "text-primary" : "text-white hover:text-primary"
            }`}
          >
            <UtensilsCrossed size={20} />
            <span className="text-xs mt-1 font-medium">Thực đơn</span>
          </Link>

          {/* Wishlist */}
          {token && (
            <Link
              to="/wishlist"
              className={`relative flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-all duration-300 min-w-[60px] ${
                location.pathname === "/wishlist" ? "text-primary" : "text-white hover:text-primary"
              }`}
            >
              <Heart size={20} />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                  {wishlistCount > 9 ? "9+" : wishlistCount}
                </span>
              )}
              <span className="text-xs mt-1 font-medium">Yêu thích</span>
            </Link>
          )}

          {/* Cart */}
          <Link
            to="/cart"
            className={`relative flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-all duration-300 min-w-[60px] ${
              location.pathname === "/cart" ? "text-primary" : "text-white hover:text-primary"
            }`}
          >
            <ShoppingCart size={20} />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-slate-900 text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                {totalItems > 9 ? "9+" : totalItems}
              </span>
            )}
            <span className="text-xs mt-1 font-medium">Giỏ hàng</span>
          </Link>

          {/* Purchase History */}
          {token && (
            <Link
              to="/purchase-history"
              className={`flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-all duration-300 min-w-[60px] ${
                location.pathname === "/purchase-history" ? "text-primary" : "text-white hover:text-primary"
              }`}
            >
              <History size={20} />
              <span className="text-xs mt-1 font-medium">Lịch sử</span>
            </Link>
          )}

          {/* User Profile */}
          {token ? (
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-all duration-300 min-w-[60px] text-white hover:text-primary"
            >
              <User size={20} />
              <span className="text-xs mt-1 font-medium">Tài khoản</span>
            </button>
          ) : (
            <button
              onClick={() => setShowLogin(true)}
              className="flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-all duration-300 min-w-[60px] text-white hover:text-primary"
            >
              <User size={20} />
              <span className="text-xs mt-1 font-medium">Đăng nhập</span>
            </button>
          )}
        </div>
      </div>

      <style jsx global>{`
        @media (max-width: 1023px) {
          body {
            padding-bottom: 80px;
          }
        }
      `}</style>
    </>
  )
}

export default Navbar
