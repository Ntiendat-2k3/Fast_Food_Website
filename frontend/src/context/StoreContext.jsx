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

  const addToCart = async (itemId, quantity = 1) => {
    if (!token) {
      alert("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng")
      return
    }

    try {
      console.log("Adding to cart with itemId:", itemId, "quantity:", quantity)
      const response = await axios.post(`${url}/api/cart/add`, { itemId: itemId, quantity }, { headers: { token } })

      if (response.data.success) {
        if (response.data.cartData) {
          setCartItems(response.data.cartData)
        } else {
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

  const removeFromCart = async (itemId) => {
    if (!token) return

    try {
      const response = await axios.post(`${url}/api/cart/remove`, { itemId }, { headers: { token } })

      if (response.data.success) {
        if (response.data.cartData) {
          setCartItems(response.data.cartData)
        } else {
          await loadCartData(token)
        }
      } else {
        console.error("Failed to remove from cart:", response.data.message)
      }
    } catch (error) {
      console.error("Error removing item from cart:", error)
    }
  }

  const removeFromCartAll = async (itemId) => {
    if (!token) return

    try {
      const response = await axios.post(`${url}/api/cart/remove-all`, { itemId }, { headers: { token } })

      if (response.data.success) {
        if (response.data.cartData) {
          setCartItems(response.data.cartData)
        } else {
          await loadCartData(token)
        }
      } else {
        console.error("Failed to remove all from cart:", response.data.message)
      }
    } catch (error) {
      console.error("Error removing all items from cart:", error)
    }
  }

  const updateCartQuantity = async (itemId, quantity) => {
    if (!token) return

    try {
      const response = await axios.post(`${url}/api/cart/update-quantity`, { itemId, quantity }, { headers: { token } })

      if (response.data.success) {
        if (response.data.cartData) {
          setCartItems(response.data.cartData)
        } else {
          await loadCartData(token)
        }
      } else {
        console.error("Failed to update cart quantity:", response.data.message)
      }
    } catch (error) {
      console.error("Error updating cart quantity:", error)
    }
  }

  const removeItemsFromCart = async (itemIds) => {
    if (!token || !itemIds || itemIds.length === 0) return

    try {
      console.log("Removing items from cart:", itemIds)
      const response = await axios.post(`${url}/api/cart/remove-items`, { itemIds }, { headers: { token } })

      if (response.data.success) {
        if (response.data.cartData) {
          setCartItems(response.data.cartData)
          console.log("Cart updated after removing items:", response.data.cartData)
        } else {
          await loadCartData(token)
        }
      } else {
        console.error("Failed to remove items from cart:", response.data.message)
      }
    } catch (error) {
      console.error("Error removing items from cart:", error)
    }
  }

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

  const getTotalCartAmount = () => {
    let totalAmount = 0
    for (const itemId in cartItems) {
      if (cartItems[itemId] > 0) {
        const itemInfo = food_list.find((product) => product._id === itemId)
        if (itemInfo) {
          totalAmount += itemInfo.price * cartItems[itemId]
        }
      }
    }
    return totalAmount
  }

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

  const fetchUserData = async (userToken) => {
    try {
      const response = await axios.get(`${url}/api/user/profile`, {
        headers: { token: userToken },
      })

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

  const logout = () => {
    setToken("")
    setUser(null)
    setCartItems({})
    setNotifications([])
    setUnreadCount(0)
    localStorage.removeItem("token")
    localStorage.removeItem("user")
  }

  const fetchNotifications = async (page = 1, limit = 20) => {
    if (!token) {
      return null
    }

    setIsLoadingNotifications(true)
    try {
      const response = await axios.get(`${url}/api/notification/list?page=${page}&limit=${limit}`, {
        headers: { token },
      })

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

  const fetchUnreadCount = async () => {
    if (!token) {
      return 0
    }

    try {
      const response = await axios.get(`${url}/api/notification/unread-count`, {
        headers: { token },
      })

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

  const markNotificationAsRead = async (notificationId) => {
    if (!token) {
      return false
    }

    try {
      // console.log("Context: Marking notification as read:", notificationId)
      const response = await axios.post(
        `${url}/api/notification/read`,
        { id: notificationId, read: true },
        { headers: { token } },
      )

      // console.log("Context: Mark as read response:", response.data)

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
    removeItemsFromCart,
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
    notifications,
    setNotifications,
    unreadCount,
    setUnreadCount,
    isLoadingNotifications,
    fetchNotifications,
    fetchUnreadCount,
    markNotificationAsRead,
  }

  useEffect(() => {
    if (token && user) {
      // console.log("Context: User logged in, fetching notifications for:", user.name)
      fetchNotifications()
      fetchUnreadCount()
    } else {
      setNotifications([])
      setUnreadCount(0)
    }
  }, [token, user])

  return <StoreContext.Provider value={contextValue}>{props.children}</StoreContext.Provider>
}

export default StoreContextProvider
