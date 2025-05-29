"use client"

import { useState, useContext, useEffect } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { StoreContext } from "../context/StoreContext"
import { useTheme } from "../context/ThemeContext"
import { ShoppingCart, User, LogOut, Package, Menu, X, Sun, Moon, Bell, Heart } from "lucide-react"
import axios from "axios"

const Navbar = ({ setShowLogin }) => {
  const { getTotalCartAmount, token, setToken, cartItems, url, user, setUser } = useContext(StoreContext)
  const { darkMode, toggleDarkMode } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [wishlistCount, setWishlistCount] = useState(0)

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
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!token) return

      try {
        const response = await axios.get(`${url}/api/notification/user`, {
          headers: { token },
        })

        if (response.data.success) {
          setNotifications(response.data.data)
          // Count unread notifications
          const unread = response.data.data.filter((notification) => !notification.read).length
          setUnreadCount(unread)
        }
      } catch (error) {
        console.error("Error fetching notifications:", error)
      }
    }

    if (token) {
      fetchNotifications()

      // Set up polling to check for new notifications every minute
      const intervalId = setInterval(fetchNotifications, 60000)
      return () => clearInterval(intervalId)
    }
  }, [token, url])

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
      await axios.post(`${url}/api/notification/read`, { id: notificationId, read: true }, { headers: { token } })

      // Update local state
      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) =>
          notification._id === notificationId ? { ...notification, read: true } : notification,
        ),
      )

      // Update unread count
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    setToken("")
    setUser(null)
    setWishlistCount(0)
    navigate("/")
  }

  const totalItems = Object.values(cartItems).reduce((a, b) => a + b, 0)

  // Get notification type style
  const getNotificationTypeStyle = (type) => {
    switch (type) {
      case "info":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
      case "warning":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
      case "success":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
      case "error":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
    }
  }

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-dark-light shadow-md py-2" : "bg-dark/80 py-4"
      }`}
    >
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <div className="bg-primary p-2 rounded-lg mr-2">
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
                className="text-dark"
              >
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-white">GreenEats</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className={`font-medium transition-colors ${
                location.pathname === "/" ? "text-primary" : "text-white hover:text-primary"
              }`}
            >
              Trang chủ
            </Link>
            <Link
              to="/foods"
              className={`font-medium transition-colors ${
                location.pathname === "/foods" ? "text-primary" : "text-white hover:text-primary"
              }`}
            >
              Thực đơn
            </Link>
            <Link
              to="/myorders"
              className={`font-medium transition-colors ${
                location.pathname === "/myorders" ? "text-primary" : "text-white hover:text-primary"
              }`}
            >
              Đơn hàng
            </Link>
            <Link
              to="/contact"
              className={`font-medium transition-colors ${
                location.pathname === "/contact" ? "text-primary" : "text-white hover:text-primary"
              }`}
            >
              Liên hệ
            </Link>
          </nav>

          {/* Right Side Icons */}
          <div className="flex items-center space-x-4">
            {/* User Greeting - Show when logged in */}
            {token && user && (
              <div className="hidden md:flex items-center mr-2">
                <span className="text-white font-medium">
                  Hi, <span className="text-primary">{user.name}</span>
                </span>
              </div>
            )}

            {/* Theme Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 text-white hover:text-primary transition-colors"
              aria-label={darkMode ? "Chuyển sang chế độ sáng" : "Chuyển sang chế độ tối"}
            >
              {darkMode ? <Sun size={24} /> : <Moon size={24} />}
            </button>

            {/* Notifications */}
            {token && (
              <div className="notifications-dropdown relative">
                <button
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="relative p-2 text-white hover:text-primary transition-colors"
                  aria-expanded={notificationsOpen}
                  aria-haspopup="true"
                >
                  <Bell size={24} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>
                {notificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-dark-light rounded-xl shadow-custom py-2 z-10 max-h-96 overflow-y-auto">
                    <div className="px-4 py-2 border-b border-gray-700">
                      <h3 className="font-medium text-white">Thông báo</h3>
                    </div>
                    {notifications.length > 0 ? (
                      <div>
                        {notifications.map((notification) => (
                          <div
                            key={notification._id}
                            className={`px-4 py-3 border-b border-gray-700 hover:bg-dark cursor-pointer ${
                              !notification.read ? "bg-blue-900/10" : ""
                            }`}
                            onClick={() => markAsRead(notification._id)}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <h4 className={`font-medium ${!notification.read ? "text-primary" : "text-white"}`}>
                                {notification.title}
                              </h4>
                              <span
                                className={`text-xs px-2 py-0.5 rounded-full ${getNotificationTypeStyle(notification.type)}`}
                              >
                                {notification.type === "info" && "Thông tin"}
                                {notification.type === "warning" && "Cảnh báo"}
                                {notification.type === "success" && "Thành công"}
                                {notification.type === "error" && "Lỗi"}
                              </span>
                            </div>
                            <p className="text-sm text-gray-300 mb-1">{notification.message}</p>
                            <p className="text-xs text-gray-400">{formatDate(notification.createdAt)}</p>
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
                )}
              </div>
            )}

            {/* Wishlist */}
            {token && (
              <Link to="/wishlist" className="relative p-2 text-white hover:text-primary transition-colors">
                <Heart size={24} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Link>
            )}

            <Link to="/cart" className="relative p-2 text-white hover:text-primary transition-colors">
              <ShoppingCart size={24} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>

            {!token ? (
              <button
                onClick={() => setShowLogin(true)}
                className="bg-primary hover:bg-primary-dark text-dark font-medium py-2 px-4 rounded-full transition-colors"
              >
                Đăng nhập
              </button>
            ) : (
              <div className="user-dropdown relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="p-2 text-white hover:text-primary transition-colors"
                  aria-expanded={dropdownOpen}
                  aria-haspopup="true"
                >
                  <User size={24} />
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-dark-light rounded-xl shadow-custom py-2 z-10">
                    {/* User name in dropdown */}
                    <div className="px-4 py-2 border-b border-gray-700">
                      <p className="font-medium text-white">
                        Hi, <span className="text-primary">{user?.name}</span>
                      </p>
                    </div>
                    <Link
                      to="/wishlist"
                      className="block px-4 py-2 text-sm text-white hover:bg-dark hover:text-primary flex items-center"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <Heart size={16} className="mr-2" />
                      Danh sách yêu thích
                    </Link>
                    <Link
                      to="/myorders"
                      className="block px-4 py-2 text-sm text-white hover:bg-dark hover:text-primary flex items-center"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <Package size={16} className="mr-2" />
                      Đơn hàng của tôi
                    </Link>
                    <button
                      onClick={() => {
                        logout()
                        setDropdownOpen(false)
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-dark hover:text-primary flex items-center"
                    >
                      <LogOut size={16} className="mr-2" />
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-white hover:text-primary transition-colors"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 bg-dark-light rounded-xl shadow-custom p-4 max-h-[calc(100vh-80px)] overflow-y-auto">
            {/* User greeting in mobile menu */}
            {token && user && (
              <div className="py-2 px-4 mb-2 border-b border-gray-700">
                <p className="font-medium text-white">
                  Hi, <span className="text-primary">{user.name}</span>
                </p>
              </div>
            )}
            <nav className="flex flex-col space-y-4">
              <Link
                to="/"
                className={`font-medium transition-colors py-2 px-4 rounded-lg ${
                  location.pathname === "/"
                    ? "text-primary bg-dark-lighter"
                    : "text-white hover:text-primary hover:bg-dark-lighter"
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Trang chủ
              </Link>
              <Link
                to="/foods"
                className={`font-medium transition-colors py-2 px-4 rounded-lg ${
                  location.pathname === "/foods"
                    ? "text-primary bg-dark-lighter"
                    : "text-white hover:text-primary hover:bg-dark-lighter"
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Thực đơn
              </Link>
              {token && (
                <Link
                  to="/wishlist"
                  className={`font-medium transition-colors py-2 px-4 rounded-lg flex items-center ${
                    location.pathname === "/wishlist"
                      ? "text-primary bg-dark-lighter"
                      : "text-white hover:text-primary hover:bg-dark-lighter"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Heart size={16} className="mr-2" />
                  Yêu thích
                  {wishlistCount > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {wishlistCount}
                    </span>
                  )}
                </Link>
              )}
              <Link
                to="/myorders"
                className={`font-medium transition-colors py-2 px-4 rounded-lg ${
                  location.pathname === "/myorders"
                    ? "text-primary bg-dark-lighter"
                    : "text-white hover:text-primary hover:bg-dark-lighter"
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Đơn hàng
              </Link>
              <Link
                to="/contact"
                className={`font-medium transition-colors py-2 px-4 rounded-lg ${
                  location.pathname === "/contact"
                    ? "text-primary bg-dark-lighter"
                    : "text-white hover:text-primary hover:bg-dark-lighter"
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Liên hệ
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

export default Navbar
