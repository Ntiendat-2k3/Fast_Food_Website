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
  // Add user state to the context
  const [user, setUser] = useState(null)
  const [isLoadingUser, setIsLoadingUser] = useState(true)

  // Cập nhật hàm addToCart để sử dụng name thay vì itemId
  const addToCart = async (itemName, quantity = 1) => {
    // Cập nhật giỏ hàng trong state
    setCartItems((prev) => ({
      ...prev,
      [itemName]: (prev[itemName] || 0) + quantity, // Sử dụng itemName làm key
    }))

    // Gửi thông tin lên server nếu có token
    if (token) {
      try {
        await axios.post(
          `${url}/api/cart/add`,
          { itemName, quantity }, // Gửi itemName thay vì itemId
          { headers: { token } },
        )
      } catch (error) {
        console.error("Error adding item to cart:", error)
      }
    }
  }

  const removeFromCart = async (itemName) => {
    setCartItems((prev) => ({ ...prev, [itemName]: prev[itemName] - 1 }))
    if (token) {
      await axios.post(url + "/api/cart/remove", { itemName }, { headers: { token } })
    }
  }

  const removeFromCartAll = async (itemName) => {
    setCartItems((prev) => ({ ...prev, [itemName]: 0 }))
    if (token) {
      await axios.post(url + "/api/cart/remove", { itemName }, { headers: { token } })
    }
  }

  const getTotalCartAmount = () => {
    let totalAmount = 0
    for (const item in cartItems) {
      if (cartItems[item] > 0) {
        const itemInfo = food_list.find((product) => product.name === item)
        if (itemInfo) {
          // Kiểm tra itemInfo có tồn tại không
          totalAmount += itemInfo.price * cartItems[item]
        }
      }
    }
    return totalAmount
  }

  const fetchFoodList = async () => {
    try {
      const response = await axios.get(url + "/api/food/list")
      setFoodList(response.data.data)
    } catch (error) {
      console.error("Error fetching food list:", error)
    }
  }

  const loadCartData = async (token) => {
    try {
      const response = await axios.post(url + "/api/cart/get", {}, { headers: { token } })
      setCartItems(response.data.cartData)
    } catch (error) {
      console.error("Error loading cart data:", error)
    }
  }

  const fetchUserData = async (token) => {
    try {
      console.log("Fetching user data with token:", token)
      const response = await axios.get(`${url}/api/user/profile`, {
        headers: { token },
      })

      if (response.data.success && response.data.user) {
        console.log("User data fetched successfully:", response.data.user)
        setUser(response.data.user)
        localStorage.setItem("user", JSON.stringify(response.data.user))
        return response.data.user
      } else {
        console.error("Failed to fetch user data:", response.data)
        return null
      }
    } catch (error) {
      console.error("Error fetching user data:", error)
      return null
    }
  }

  // Update the useEffect to load user data from localStorage
  useEffect(() => {
    async function loadData() {
      setIsLoadingUser(true)

      try {
        await fetchFoodList()

        const storedToken = localStorage.getItem("token")
        if (storedToken) {
          console.log("Found token in localStorage:", storedToken)
          setToken(storedToken)

          // Try to load user from localStorage first
          const storedUser = localStorage.getItem("user")
          if (storedUser) {
            try {
              const parsedUser = JSON.parse(storedUser)
              console.log("Loaded user from localStorage:", parsedUser)
              setUser(parsedUser)
            } catch (error) {
              console.error("Error parsing user data from localStorage:", error)
              // If parsing fails, clear the invalid data
              localStorage.removeItem("user")
            }
          }

          // Load cart data
          await loadCartData(storedToken)

          // If no user in localStorage or parsing failed, fetch from API
          if (!user) {
            console.log("No user in state, fetching from API")
            await fetchUserData(storedToken)
          }
        } else {
          console.log("No token found in localStorage")
        }
      } catch (error) {
        console.error("Error in loadData:", error)
      } finally {
        setIsLoadingUser(false)
      }
    }

    loadData()
  }, [])

  // Function to handle logout
  const logout = () => {
    setToken("")
    setUser(null)
    localStorage.removeItem("token")
    localStorage.removeItem("user")
  }

  // Update the contextValue to include user and setUser
  const contextValue = {
    food_list,
    cartItems,
    setCartItems,
    addToCart,
    removeFromCartAll,
    removeFromCart,
    getTotalCartAmount,
    url,
    token,
    setToken,
    user,
    setUser,
    isLoadingUser,
    logout,
    fetchUserData,
  }

  return <StoreContext.Provider value={contextValue}>{props.children}</StoreContext.Provider>
}

export default StoreContextProvider
