"use client"

import axios from "axios"
import { createContext, useContext, useEffect, useState } from "react"

export const StoreContext = createContext(null)

// Create a custom hook to use the StoreContext
export const useStore = () => {
  const context = useContext(StoreContext)
  if (!context) {
    throw new Error("useStore must be used within a StoreContextProvider")
  }
  return context
}

const StoreContextProvider = (props) => {
  const [cartItems, setCartItems] = useState({})
  const url = "http://localhost:4000"
  const [token, setToken] = useState("")
  const [food_list, setFoodList] = useState([])
  const [user, setUser] = useState(null)
  const [isLoadingUser, setIsLoadingUser] = useState(true)
  const [isLoadingCart, setIsLoadingCart] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false)

  // Add to cart - Save to database immediately
  const addToCart = async (itemName, quantity = 1) => {
    if (!token) {
      alert("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng")
      return
    }

    try {
      const response = await axios.post(`${url}/api/cart/add`, { itemName, quantity }, { headers: { token } })

      if (response.data.success) {
        // Update local state with the returned cart data
        if (response.data.cartData) {
          setCartItems(response.data.cartData)
        } else {
          // If no cart data returned, reload cart from database
          await loadCartData(token)
        }
      } else {
        console.error("Failed to add to cart:", response.data.message)
        alert(response.data.message || "Lỗi khi thêm vào giỏ hàng")
      }
    } catch (error) {
      console.error("Error adding item to cart:", error)
      alert("Lỗi khi thêm vào giỏ hàng")
    }
  }

  // Remove from cart - Update database immediately
  const removeFromCart = async (itemName) => {
    if (!token) return

    try {
      const response = await axios.post(`${url}/api/cart/remove`, { itemName }, { headers: { token } })

      if (response.data.success) {
        // Update local state with the returned cart data
        if (response.data.cartData) {
          setCartItems(response.data.cartData)
        } else {
          // If no cart data returned, reload cart from database
          await loadCartData(token)
        }
      } else {
        console.error("Failed to remove from cart:", response.data.message)
      }
    } catch (error) {
      console.error("Error removing item from cart:", error)
    }
  }

  // Remove all quantity of an item
  const removeFromCartAll = async (itemName) => {
    if (!token) return

    try {
      const response = await axios.post(`${url}/api/cart/remove-all`, { itemName }, { headers: { token } })

      if (response.data.success) {
        // Update local state with the returned cart data
        if (response.data.cartData) {
          setCartItems(response.data.cartData)
        } else {
          // If no cart data returned, reload cart from database
          await loadCartData(token)
        }
      } else {
        console.error("Failed to remove all from cart:", response.data.message)
      }
    } catch (error) {
      console.error("Error removing all items from cart:", error)
    }
  }

  // Update cart quantity directly
  const updateCartQuantity = async (itemName, quantity) => {
    if (!token) return

    try {
      const response = await axios.post(
        `${url}/api/cart/update-quantity`,
        { itemName, quantity },
        { headers: { token } },
      )

      if (response.data.success) {
        // Update local state with the returned cart data
        if (response.data.cartData) {
          setCartItems(response.data.cartData)
        } else {
          // If no cart data returned, reload cart from database
          await loadCartData(token)
        }
      } else {
        console.error("Failed to update cart quantity:", response.data.message)
      }
    } catch (error) {
      console.error("Error updating cart quantity:", error)
    }
  }

  // Load cart data from database
  const loadCartData = async (userToken) => {
    if (!userToken) {
      setCartItems({})
      return
    }

    setIsLoadingCart(true)
    try {
      const response = await axios.post(`${url}/api/cart/get`, {}, { headers: { token: userToken } })

      if (response.data.success) {
        const cartData = response.data.cartData || {}
        setCartItems(cartData)
      } else {
        console.error("Failed to load cart:", response.data.message)
        setCartItems({})
      }
    } catch (error) {
      console.error("Error loading cart data:", error)
      setCartItems({})
    } finally {
      setIsLoadingCart(false)
    }
  }

  // Clear cart
  const clearCart = async () => {
    if (!token) return

    try {
      const response = await axios.post(`${url}/api/cart/clear`, {}, { headers: { token } })

      if (response.data.success) {
        setCartItems({})
      }
    } catch (error) {
      console.error("Error clearing cart:", error)
    }
  }

  // Calculate total cart amount
  const getTotalCartAmount = () => {
    let totalAmount = 0
    for (const item in cartItems) {
      if (cartItems[item] > 0) {
        const itemInfo = food_list.find((product) => product.name === item)
        if (itemInfo) {
          totalAmount += itemInfo.price * cartItems[item]
        }
      }
    }
    return totalAmount
  }

  // Fetch food list
  const fetchFoodList = async () => {
    try {
      const response = await axios.get(`${url}/api/food/list`)
      if (response.data.success) {
        setFoodList(response.data.data)
      }
    } catch (error) {
      console.error("Error fetching food list:", error)
    }
  }

  // Fetch user data
  const fetchUserData = async (userToken) => {
    try {
      const response = await axios.get(`${url}/api/user/profile`, {
        headers: { token: userToken },
      })

      // Check if the request was successful and the user data is in response.data.data
      if (response.data.success && response.data.data) {
        setUser(response.data.data) // Use response.data.data
        localStorage.setItem("user", JSON.stringify(response.data.data)) // Use response.data.data
        return response.data.data // Use response.data.data
      } else {
        console.error("Failed to fetch user data:", response.data)
        return null
      }
    } catch (error) {
      console.error("Error fetching user data:", error)
      return null
    }
  }

  // Initialize data on app load
  useEffect(() => {
    async function loadData() {
      setIsLoadingUser(true)

      try {
        // Always fetch food list first
        await fetchFoodList()

        const storedToken = localStorage.getItem("token")

        if (storedToken) {
          setToken(storedToken)

          // Load user from localStorage first
          const storedUser = localStorage.getItem("user")
          if (storedUser) {
            try {
              const parsedUser = JSON.parse(storedUser)
              setUser(parsedUser)
            } catch (error) {
              console.error("Error parsing user data:", error)
              localStorage.removeItem("user")
            }
          }

          // Load cart data from database
          await loadCartData(storedToken)

          // Fetch fresh user data if not in localStorage
          if (!user) {
            await fetchUserData(storedToken)
          }
        } else {
          setCartItems({})
        }
      } catch (error) {
        console.error("Error in loadData:", error)
      } finally {
        setIsLoadingUser(false)
      }
    }

    loadData()
  }, [])

  // Reload cart when token changes (login/logout)
  useEffect(() => {
    if (token) {
      loadCartData(token)
    } else {
      setCartItems({})
    }
  }, [token])

  // Function to handle logout
  const logout = () => {
    setToken("")
    setUser(null)
    setCartItems({})
    setNotifications([])
    setUnreadCount(0)
    localStorage.removeItem("token")
    localStorage.removeItem("user")
  }

  // Fetch user notifications
  const fetchNotifications = async (page = 1, limit = 20) => {
    if (!token) {
      console.log("No token available for fetching notifications in context")
      return null
    }

    setIsLoadingNotifications(true)
    try {
      console.log("Context: Fetching notifications with token...")
      const response = await axios.get(`${url}/api/notification/list?page=${page}&limit=${limit}`, {
        headers: { token },
      })

      console.log("Context: Notifications response:", response.data)

      if (response.data.success) {
        setNotifications(response.data.data || [])
        return response.data
      } else {
        console.error("Context: Failed to fetch notifications:", response.data.message)
        setNotifications([])
        return null
      }
    } catch (error) {
      console.error("Context: Error fetching notifications:", error)
      if (error.response) {
        console.error("Context: Error response:", error.response.data)
      }
      setNotifications([])
      return null
    } finally {
      setIsLoadingNotifications(false)
    }
  }

  // Fetch unread notification count
  const fetchUnreadCount = async () => {
    if (!token) {
      console.log("No token available for fetching unread count in context")
      return 0
    }

    try {
      console.log("Context: Fetching unread count...")
      const response = await axios.get(`${url}/api/notification/unread-count`, {
        headers: { token },
      })

      console.log("Context: Unread count response:", response.data)

      if (response.data.success) {
        const count = response.data.data.count || 0
        setUnreadCount(count)
        return count
      } else {
        console.error("Context: Failed to fetch unread count:", response.data.message)
        setUnreadCount(0)
        return 0
      }
    } catch (error) {
      console.error("Context: Error fetching unread count:", error)
      if (error.response) {
        console.error("Context: Error response:", error.response.data)
      }
      setUnreadCount(0)
      return 0
    }
  }

  // Mark notification as read
  const markNotificationAsRead = async (notificationId) => {
    if (!token) {
      console.log("No token available for marking notification as read")
      return false
    }

    try {
      console.log("Context: Marking notification as read:", notificationId)
      const response = await axios.post(
        `${url}/api/notification/read`,
        { id: notificationId, read: true },
        { headers: { token } },
      )

      console.log("Context: Mark as read response:", response.data)

      if (response.data.success) {
        // Update local notifications state
        setNotifications((prevNotifications) =>
          prevNotifications.map((notification) =>
            notification._id === notificationId ? { ...notification, read: true, isRead: true } : notification,
          ),
        )

        // Update unread count
        setUnreadCount((prev) => Math.max(0, prev - 1))

        return true
      } else {
        console.error("Context: Failed to mark notification as read:", response.data.message)
        return false
      }
    } catch (error) {
      console.error("Context: Error marking notification as read:", error)
      if (error.response) {
        console.error("Context: Error response:", error.response.data)
      }
      return false
    }
  }

  const contextValue = {
    food_list,
    cartItems,
    setCartItems,
    addToCart,
    removeFromCartAll,
    removeFromCart,
    updateCartQuantity,
    getTotalCartAmount,
    url,
    token,
    setToken,
    user,
    setUser,
    isLoadingUser,
    isLoadingCart,
    logout,
    fetchUserData,
    clearCart,
    loadCartData,
    // Notification functions
    notifications,
    setNotifications,
    unreadCount,
    setUnreadCount,
    isLoadingNotifications,
    fetchNotifications,
    fetchUnreadCount,
    markNotificationAsRead,
  }

  // Fetch notifications when user logs in
  useEffect(() => {
    if (token && user) {
      console.log("Context: User logged in, fetching notifications for:", user.name)
      fetchNotifications()
      fetchUnreadCount()
    } else {
      console.log("Context: No token or user, clearing notifications")
      setNotifications([])
      setUnreadCount(0)
    }
  }, [token, user])

  return <StoreContext.Provider value={contextValue}>{props.children}</StoreContext.Provider>
}

export default StoreContextProvider
