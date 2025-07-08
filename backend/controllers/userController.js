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
    const user = await userModel.findOne({ email })

    if (!user) {
      return res.json({ success: false, message: "User Doesn't exist" })
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
    res.json({ success: true, token, user: { id: user._id, name: user.name, email: user.email, role: user.role } })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: "Error" })
  }
}

// Register user
const registerUser = async (req, res) => {
  const { name, password, email } = req.body
  try {
    // Checking if user already exists
    const exists = await userModel.findOne({ email })
    if (exists) {
      return res.json({ success: false, message: "User already exists" })
    }

    // Validating email format & strong password
    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: "Please enter a valid email" })
    }

    if (password.length < 8) {
      return res.json({ success: false, message: "Please enter a strong password" })
    }

    // Hashing user password
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

    res.json({ success: true, token, user: { id: user._id, name: user.name, email: user.email, role: user.role } })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: "Error" })
  }
}

// Admin login
const adminLogin = async (req, res) => {
  const { email, password } = req.body
  try {
    const user = await userModel.findOne({ email })

    if (!user) {
      return res.json({ success: false, message: "User doesn't exist" })
    }

    // Check if user is admin or staff
    if (user.role !== "admin" && user.role !== "staff") {
      return res.json({ success: false, message: "Not authorized" })
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
      return res.json({ success: false, message: "Invalid credentials" })
    }

    const token = createToken(user._id)
    res.json({ success: true, token, user: { id: user._id, name: user.name, email: user.email, role: user.role } })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: "Error" })
  }
}

// Get user profile
const getUserProfile = async (req, res) => {
  try {
    const user = await userModel.findById(req.body.userId).select("-password")
    if (!user) {
      return res.json({ success: false, message: "User not found" })
    }
    res.json({ success: true, user })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: "Error" })
  }
}

// Update user profile
const updateUserProfile = async (req, res) => {
  try {
    const { name, email } = req.body
    const userId = req.body.userId

    // Validate email format
    if (email && !validator.isEmail(email)) {
      return res.json({ success: false, message: "Please enter a valid email" })
    }

    // Check if email already exists (excluding current user)
    if (email) {
      const existingUser = await userModel.findOne({ email, _id: { $ne: userId } })
      if (existingUser) {
        return res.json({ success: false, message: "Email already exists" })
      }
    }

    const updateData = {}
    if (name) updateData.name = name
    if (email) updateData.email = email

    const user = await userModel.findByIdAndUpdate(userId, updateData, { new: true }).select("-password")

    if (!user) {
      return res.json({ success: false, message: "User not found" })
    }

    res.json({ success: true, message: "Profile updated successfully", user })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: "Error updating profile" })
  }
}

// Change password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body
    const userId = req.body.userId

    if (!currentPassword || !newPassword) {
      return res.json({ success: false, message: "Please provide current and new password" })
    }

    if (newPassword.length < 8) {
      return res.json({ success: false, message: "New password must be at least 8 characters long" })
    }

    const user = await userModel.findById(userId)
    if (!user) {
      return res.json({ success: false, message: "User not found" })
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password)
    if (!isMatch) {
      return res.json({ success: false, message: "Current password is incorrect" })
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(newPassword, salt)

    await userModel.findByIdAndUpdate(userId, { password: hashedPassword })

    res.json({ success: true, message: "Password changed successfully" })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: "Error changing password" })
  }
}

// Get all users (Admin/Staff only)
const getAllUsers = async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    const users = await userModel.find({}).select("-password").skip(skip).limit(limit).sort({ createdAt: -1 })

    const total = await userModel.countDocuments({})

    res.json({
      success: true,
      users,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        count: users.length,
        totalUsers: total,
      },
    })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: "Error fetching users" })
  }
}

// Get user statistics (Admin/Staff only)
const getUserStats = async (req, res) => {
  try {
    const totalUsers = await userModel.countDocuments({})
    const adminCount = await userModel.countDocuments({ role: "admin" })
    const staffCount = await userModel.countDocuments({ role: "staff" })
    const userCount = await userModel.countDocuments({ role: "user" })
    const blockedCount = await blacklistModel.countDocuments({})

    res.json({
      success: true,
      stats: {
        total: totalUsers,
        admin: adminCount,
        staff: staffCount,
        users: userCount,
        blocked: blockedCount,
      },
    })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: "Error fetching user statistics" })
  }
}

// Block user (Admin/Staff only)
const blockUser = async (req, res) => {
  try {
    const { userId, reason } = req.body
    const adminId = req.body.userId

    if (!userId) {
      return res.json({ success: false, message: "User ID is required" })
    }

    // Get user to block
    const userToBlock = await userModel.findById(userId)
    if (!userToBlock) {
      return res.json({ success: false, message: "User not found" })
    }

    // Get admin/staff info
    const admin = await userModel.findById(adminId)

    // Prevent staff from blocking admin or other staff
    if (admin.role === "staff" && (userToBlock.role === "admin" || userToBlock.role === "staff")) {
      return res.json({ success: false, message: "Staff cannot block admin or other staff members" })
    }

    // Check if user is already blocked
    const existingBlock = await blacklistModel.findOne({ userId })
    if (existingBlock) {
      return res.json({ success: false, message: "User is already blocked" })
    }

    // Create blacklist entry
    const blacklistEntry = new blacklistModel({
      userId,
      reason: reason || "Blocked by admin/staff",
      blockedBy: adminId,
      blockedAt: new Date(),
    })

    await blacklistEntry.save()

    console.log(`User ${userToBlock.name} blocked by ${admin.name} (${admin.role})`)
    res.json({ success: true, message: "User blocked successfully" })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: "Error blocking user" })
  }
}

// Unblock user (Admin/Staff only)
const unblockUser = async (req, res) => {
  try {
    const { userId } = req.body
    const adminId = req.body.userId

    if (!userId) {
      return res.json({ success: false, message: "User ID is required" })
    }

    const blacklistEntry = await blacklistModel.findOneAndDelete({ userId })
    if (!blacklistEntry) {
      return res.json({ success: false, message: "User is not blocked" })
    }

    const user = await userModel.findById(userId)
    const admin = await userModel.findById(adminId)

    console.log(`User ${user?.name} unblocked by ${admin?.name} (${admin?.role})`)
    res.json({ success: true, message: "User unblocked successfully" })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: "Error unblocking user" })
  }
}

// Get blacklist (Admin/Staff only)
const getBlacklist = async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    const blacklist = await blacklistModel
      .find({})
      .populate("userId", "name email")
      .populate("blockedBy", "name role")
      .skip(skip)
      .limit(limit)
      .sort({ blockedAt: -1 })

    const total = await blacklistModel.countDocuments({})

    res.json({
      success: true,
      blacklist,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        count: blacklist.length,
        totalBlocked: total,
      },
    })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: "Error fetching blacklist" })
  }
}

// Update user role (Admin only)
const updateUserRole = async (req, res) => {
  try {
    const { userId, newRole } = req.body
    const adminId = req.body.userId

    if (!userId || !newRole) {
      return res.json({ success: false, message: "User ID and new role are required" })
    }

    if (!["user", "staff", "admin"].includes(newRole)) {
      return res.json({ success: false, message: "Invalid role" })
    }

    const user = await userModel.findByIdAndUpdate(userId, { role: newRole }, { new: true }).select("-password")

    if (!user) {
      return res.json({ success: false, message: "User not found" })
    }

    const admin = await userModel.findById(adminId)
    console.log(`User ${user.name} role updated to ${newRole} by ${admin.name}`)

    res.json({ success: true, message: "User role updated successfully", user })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: "Error updating user role" })
  }
}

// Delete user (Admin only)
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params
    const adminId = req.body.userId

    if (!id) {
      return res.json({ success: false, message: "User ID is required" })
    }

    const user = await userModel.findById(id)
    if (!user) {
      return res.json({ success: false, message: "User not found" })
    }

    // Prevent deleting admin accounts
    if (user.role === "admin") {
      return res.json({ success: false, message: "Cannot delete admin accounts" })
    }

    // Remove from blacklist if exists
    await blacklistModel.deleteOne({ userId: id })

    // Delete user
    await userModel.findByIdAndDelete(id)

    const admin = await userModel.findById(adminId)
    console.log(`User ${user.name} deleted by ${admin.name}`)

    res.json({ success: true, message: "User deleted successfully" })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: "Error deleting user" })
  }
}

export {
  loginUser,
  registerUser,
  adminLogin,
  getUserProfile,
  updateUserProfile,
  changePassword,
  getAllUsers,
  getUserStats,
  blockUser,
  unblockUser,
  getBlacklist,
  updateUserRole,
  deleteUser,
}
