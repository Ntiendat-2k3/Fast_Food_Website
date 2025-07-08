import userModel from "../models/userModel.js"
import blacklistModel from "../models/blacklistModel.js"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import validator from "validator"

// Create token
const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET)
}

// Login user
const loginUser = async (req, res) => {
  const { email, password } = req.body
  try {
    console.log("User login attempt:", email)

    const user = await userModel.findOne({ email })

    if (!user) {
      return res.json({ success: false, message: "User doesn't exist" })
    }

    // Check if user is blocked
    const isBlocked = await blacklistModel.findOne({ userId: user._id })
    if (isBlocked) {
      return res.json({ success: false, message: "Your account has been blocked" })
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
      return res.json({ success: false, message: "Invalid credentials" })
    }

    const token = createToken(user._id)
    console.log("User login successful:", user.name)
    res.json({ success: true, token, user: { id: user._id, name: user.name, email: user.email, role: user.role } })
  } catch (error) {
    console.error("Login error:", error)
    res.json({ success: false, message: "Error" })
  }
}

// Register user
const registerUser = async (req, res) => {
  const { name, password, email } = req.body
  try {
    console.log("User registration attempt:", email)

    // Check if user already exists
    const exists = await userModel.findOne({ email })
    if (exists) {
      return res.json({ success: false, message: "User already exists" })
    }

    // Validate email format & strong password
    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: "Please enter a valid email" })
    }

    if (password.length < 8) {
      return res.json({ success: false, message: "Please enter a strong password" })
    }

    // Hash user password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    const newUser = new userModel({
      name: name,
      email: email,
      password: hashedPassword,
      role: "user",
    })

    const user = await newUser.save()
    const token = createToken(user._id)

    console.log("User registered successfully:", user.name)
    res.json({ success: true, token, user: { id: user._id, name: user.name, email: user.email, role: user.role } })
  } catch (error) {
    console.error("Registration error:", error)
    res.json({ success: false, message: "Error" })
  }
}

// Admin login
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body
    console.log("Admin login attempt:", email)

    const user = await userModel.findOne({ email })
    if (!user) {
      return res.json({ success: false, message: "Invalid credentials" })
    }

    // Check if user has admin or staff role
    if (user.role !== "admin" && user.role !== "staff") {
      return res.json({ success: false, message: "Access denied: Admin or Staff role required" })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.json({ success: false, message: "Invalid credentials" })
    }

    const token = createToken(user._id)
    console.log("Admin/Staff login successful:", user.name, "Role:", user.role)
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    console.error("Admin login error:", error)
    res.json({ success: false, message: "Error during login" })
  }
}

// Get all users (admin/staff only)
const getAllUsers = async (req, res) => {
  try {
    console.log("Getting all users - requested by:", req.user.name, "Role:", req.user.role)

    const users = await userModel.find({}).select("-password")

    console.log(`Found ${users.length} users`)
    res.json({
      success: true,
      users,
    })
  } catch (error) {
    console.error("Error getting all users:", error)
    res.json({
      success: false,
      message: "Error getting users",
    })
  }
}

// Block user (admin/staff only)
const blockUser = async (req, res) => {
  try {
    const { userId, reason } = req.body
    const blockedBy = req.user._id

    console.log("Blocking user:", userId, "by:", req.user.name, "Reason:", reason)

    // Check if user exists
    const user = await userModel.findById(userId)
    if (!user) {
      return res.json({
        success: false,
        message: "User not found",
      })
    }

    // Prevent staff from blocking admin or other staff
    if (req.user.role === "staff" && (user.role === "admin" || user.role === "staff")) {
      return res.json({
        success: false,
        message: "Staff cannot block admin or staff users",
      })
    }

    // Check if user is already blocked
    const existingBlock = await blacklistModel.findOne({ userId })
    if (existingBlock) {
      return res.json({
        success: false,
        message: "User is already blocked",
      })
    }

    // Create blacklist entry
    const blacklistEntry = new blacklistModel({
      userId,
      reason: reason || "No reason provided",
      blockedBy,
      blockedAt: new Date(),
    })

    await blacklistEntry.save()

    console.log("User blocked successfully:", user.name)
    res.json({
      success: true,
      message: "User blocked successfully",
    })
  } catch (error) {
    console.error("Error blocking user:", error)
    res.json({
      success: false,
      message: "Error blocking user",
    })
  }
}

// Unblock user (admin/staff only)
const unblockUser = async (req, res) => {
  try {
    const { userId } = req.body

    console.log("Unblocking user:", userId, "by:", req.user.name)

    // Check if user exists
    const user = await userModel.findById(userId)
    if (!user) {
      return res.json({
        success: false,
        message: "User not found",
      })
    }

    // Remove from blacklist
    const result = await blacklistModel.findOneAndDelete({ userId })
    if (!result) {
      return res.json({
        success: false,
        message: "User is not blocked",
      })
    }

    console.log("User unblocked successfully:", user.name)
    res.json({
      success: true,
      message: "User unblocked successfully",
    })
  } catch (error) {
    console.error("Error unblocking user:", error)
    res.json({
      success: false,
      message: "Error unblocking user",
    })
  }
}

// Get blacklist (admin/staff only)
const getBlacklist = async (req, res) => {
  try {
    console.log("Getting blacklist - requested by:", req.user.name, "Role:", req.user.role)

    const blacklist = await blacklistModel
      .find({})
      .populate("userId", "name email")
      .populate("blockedBy", "name")
      .sort({ blockedAt: -1 })

    console.log(`Found ${blacklist.length} blocked users`)
    res.json({
      success: true,
      blacklist,
    })
  } catch (error) {
    console.error("Error getting blacklist:", error)
    res.json({
      success: false,
      message: "Error getting blacklist",
    })
  }
}

// Update user role (admin only)
const updateUserRole = async (req, res) => {
  try {
    const { userId, role } = req.body

    console.log("Updating user role:", userId, "to:", role, "by:", req.user.name)

    // Validate role
    if (!["user", "staff", "admin"].includes(role)) {
      return res.json({
        success: false,
        message: "Invalid role",
      })
    }

    const user = await userModel.findByIdAndUpdate(userId, { role }, { new: true }).select("-password")

    if (!user) {
      return res.json({
        success: false,
        message: "User not found",
      })
    }

    console.log("User role updated successfully:", user.name, "to:", role)
    res.json({
      success: true,
      message: "User role updated successfully",
      user,
    })
  } catch (error) {
    console.error("Error updating user role:", error)
    res.json({
      success: false,
      message: "Error updating user role",
    })
  }
}

// Get user profile
const getUserProfile = async (req, res) => {
  try {
    const userId = req.user._id

    const user = await userModel.findById(userId).select("-password")
    if (!user) {
      return res.json({
        success: false,
        message: "User not found",
      })
    }

    res.json({
      success: true,
      user,
    })
  } catch (error) {
    console.error("Error getting user profile:", error)
    res.json({
      success: false,
      message: "Error getting profile",
    })
  }
}

// Update user profile
const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user._id
    const { name, email } = req.body

    // Validate email if provided
    if (email && !validator.isEmail(email)) {
      return res.json({
        success: false,
        message: "Please enter a valid email",
      })
    }

    const user = await userModel.findByIdAndUpdate(userId, { name, email }, { new: true }).select("-password")

    if (!user) {
      return res.json({
        success: false,
        message: "User not found",
      })
    }

    console.log("User profile updated:", user.name)
    res.json({
      success: true,
      message: "Profile updated successfully",
      user,
    })
  } catch (error) {
    console.error("Error updating user profile:", error)
    res.json({
      success: false,
      message: "Error updating profile",
    })
  }
}

// Delete user (admin only)
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params

    console.log("Deleting user:", id, "by:", req.user.name)

    const user = await userModel.findById(id)
    if (!user) {
      return res.json({
        success: false,
        message: "User not found",
      })
    }

    // Prevent deleting admin users
    if (user.role === "admin") {
      return res.json({
        success: false,
        message: "Cannot delete admin users",
      })
    }

    // Remove from blacklist if exists
    await blacklistModel.findOneAndDelete({ userId: id })

    // Delete user
    await userModel.findByIdAndDelete(id)

    console.log("User deleted successfully:", user.name)
    res.json({
      success: true,
      message: "User deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting user:", error)
    res.json({
      success: false,
      message: "Error deleting user",
    })
  }
}

export {
  loginUser,
  registerUser,
  adminLogin,
  getAllUsers,
  blockUser,
  unblockUser,
  getBlacklist,
  updateUserRole,
  getUserProfile,
  updateUserProfile,
  deleteUser,
}
