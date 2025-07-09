import userModel from "../models/userModel.js"
import blacklistModel from "../models/blacklistModel.js"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import validator from "validator"

// Create token
const createToken = (id, role = "user") => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "7d" })
}

// Google Login
const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body
    console.log("Google login attempt with credential:", credential ? "Present" : "Missing")

    if (!credential) {
      return res.json({ success: false, message: "Thiếu Google credential" })
    }

    // Decode Google JWT token
    const { OAuth2Client } = await import("google-auth-library")
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    })

    const payload = ticket.getPayload()
    console.log("Google payload:", payload)

    const { email, name, picture, sub: googleId } = payload

    // Check if user exists
    let user = await userModel.findOne({ email })

    if (user) {
      // User exists, update Google info if needed
      if (!user.googleId) {
        user.googleId = googleId
        user.avatar = picture
        await user.save()
      }
    } else {
      // Create new user
      user = new userModel({
        name,
        email,
        googleId,
        avatar: picture,
        password: await bcrypt.hash(Math.random().toString(36), 10), // Random password
        role: "user",
      })
      await user.save()
    }

    const token = createToken(user._id, user.role)

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
      message: "Đăng nhập Google thành công",
    })
  } catch (error) {
    console.error("Google login error:", error)
    res.json({ success: false, message: "Lỗi xác thực Google: " + error.message })
  }
}

// Login user
const loginUser = async (req, res) => {
  const { email, password } = req.body
  try {
    const user = await userModel.findOne({ email })

    if (!user) {
      return res.json({ success: false, message: "Người dùng không tồn tại" })
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
      return res.json({ success: false, message: "Mật khẩu không đúng" })
    }

    const token = createToken(user._id, user.role)
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
    console.log(error)
    res.json({ success: false, message: "Lỗi server" })
  }
}

// Admin login (separate endpoint for admin panel)
const adminLogin = async (req, res) => {
  const { email, password } = req.body

  console.log("Admin login attempt:", { email })

  try {
    const user = await userModel.findOne({ email })
    console.log("User found:", user ? { id: user._id, email: user.email, role: user.role } : "No user")

    if (!user) {
      console.log("User not found")
      return res.json({ success: false, message: "Tài khoản không tồn tại" })
    }

    // Check if user is admin or staff
    if (!["admin", "staff"].includes(user.role)) {
      console.log("User role not allowed:", user.role)
      return res.json({ success: false, message: "Bạn không có quyền truy cập admin panel" })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    console.log("Password match:", isMatch)

    if (!isMatch) {
      return res.json({ success: false, message: "Mật khẩu không đúng" })
    }

    const token = createToken(user._id, user.role)
    console.log("Login successful, role:", user.role)

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      message: "Đăng nhập thành công",
    })
  } catch (error) {
    console.error("Admin login error:", error)
    res.json({ success: false, message: "Lỗi server: " + error.message })
  }
}

// Register user
const registerUser = async (req, res) => {
  const { name, password, email, role = "user" } = req.body
  try {
    // Check if user already exists
    const exists = await userModel.findOne({ email })
    if (exists) {
      return res.json({ success: false, message: "Người dùng đã tồn tại" })
    }

    // Validate email format & strong password
    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: "Vui lòng nhập email hợp lệ" })
    }

    if (password.length < 8) {
      return res.json({ success: false, message: "Vui lòng nhập mật khẩu mạnh (ít nhất 8 ký tự)" })
    }

    // Hash user password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    const newUser = new userModel({
      name: name,
      email: email,
      password: hashedPassword,
      role: role,
    })

    const user = await newUser.save()
    const token = createToken(user._id, user.role)

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
    console.log(error)
    res.json({ success: false, message: "Lỗi server" })
  }
}

// Get user profile
const getUserProfile = async (req, res) => {
  try {
    const user = await userModel.findById(req.userId).select("-password")
    if (!user) {
      return res.json({ success: false, message: "Người dùng không tồn tại" })
    }
    res.json({ success: true, data: user })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: "Lỗi server" })
  }
}

// Update user profile
const updateUserProfile = async (req, res) => {
  try {
    const { name, email } = req.body
    const user = await userModel.findByIdAndUpdate(req.userId, { name, email }, { new: true }).select("-password")

    res.json({ success: true, data: user })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: "Lỗi server" })
  }
}

// Get all users (admin/staff only)
const getAllUsers = async (req, res) => {
  try {
    console.log("=== GET ALL USERS ===")
    console.log("Request user ID:", req.userId)
    console.log("Request user role:", req.userRole)
    console.log(
      "Request user object:",
      req.user ? { id: req.user._id, name: req.user.name, role: req.user.role } : "No user object",
    )

    if (!req.user || !req.userRole) {
      console.log("Missing user information in request")
      return res.json({ success: false, message: "Thông tin người dùng không hợp lệ" })
    }

    if (!["admin", "staff"].includes(req.userRole)) {
      console.log("Insufficient permissions - role:", req.userRole)
      return res.json({ success: false, message: "Không có quyền truy cập" })
    }

    console.log("Fetching users from database...")
    const users = await userModel.find({}).select("-password").sort({ createdAt: -1 })
    console.log(`Successfully found ${users.length} users`)

    res.json({
      success: true,
      data: users,
      message: `Tìm thấy ${users.length} người dùng`,
    })
  } catch (error) {
    console.error("Error in getAllUsers:", error)
    res.json({ success: false, message: "Lỗi server: " + error.message })
  }
}

// Block user
const blockUser = async (req, res) => {
  try {
    const { userId, reason } = req.body
    console.log("Blocking user:", { userId, reason, blockedBy: req.userId })

    if (!userId || !reason) {
      return res.json({ success: false, message: "Thiếu thông tin userId hoặc reason" })
    }

    // Check if user exists
    const user = await userModel.findById(userId)
    if (!user) {
      return res.json({ success: false, message: "Người dùng không tồn tại" })
    }

    // Check if user is already blocked
    const existingBlock = await blacklistModel.findOne({ userId })
    if (existingBlock) {
      return res.json({ success: false, message: "Người dùng đã bị chặn" })
    }

    // Get blocker info
    const blocker = await userModel.findById(req.userId)

    // Create blacklist entry
    const blacklistEntry = new blacklistModel({
      userId,
      reason,
      blockedBy: blocker ? blocker.name : "Admin",
    })

    await blacklistEntry.save()
    console.log("User blocked successfully")

    res.json({ success: true, message: "Đã chặn người dùng thành công" })
  } catch (error) {
    console.error("Error blocking user:", error)
    res.json({ success: false, message: "Lỗi server: " + error.message })
  }
}

// Unblock user
const unblockUser = async (req, res) => {
  try {
    const { blacklistId } = req.body
    console.log("Unblocking user with blacklist ID:", blacklistId)

    if (!blacklistId) {
      return res.json({ success: false, message: "Thiếu blacklistId" })
    }

    const result = await blacklistModel.findByIdAndDelete(blacklistId)
    if (!result) {
      return res.json({ success: false, message: "Không tìm thấy bản ghi chặn" })
    }

    console.log("User unblocked successfully")
    res.json({ success: true, message: "Đã bỏ chặn người dùng thành công" })
  } catch (error) {
    console.error("Error unblocking user:", error)
    res.json({ success: false, message: "Lỗi server: " + error.message })
  }
}

// Get blacklist
const getBlacklist = async (req, res) => {
  try {
    console.log("=== GET BLACKLIST ===")
    console.log("Request user role:", req.userRole)
    console.log("Request user:", req.user ? req.user.name : "No user")

    const blacklist = await blacklistModel.find({}).populate("userId", "name email").sort({ blockedAt: -1 })

    // Transform data to include user info directly
    const transformedBlacklist = blacklist.map((item) => ({
      _id: item._id,
      userId: item.userId._id,
      userName: item.userId.name,
      email: item.userId.email,
      reason: item.reason,
      blockedAt: item.blockedAt,
      blockedBy: item.blockedBy,
    }))

    console.log(`Found ${transformedBlacklist.length} blocked users`)

    res.json({
      success: true,
      data: transformedBlacklist,
      message: `Tìm thấy ${transformedBlacklist.length} người dùng bị chặn`,
    })
  } catch (error) {
    console.error("Error getting blacklist:", error)
    res.json({ success: false, message: "Lỗi server: " + error.message })
  }
}

// Delete user (admin only)
const deleteUser = async (req, res) => {
  try {
    const { userId } = req.body

    if (!userId) {
      return res.json({ success: false, message: "Thiếu userId" })
    }

    const user = await userModel.findByIdAndDelete(userId)
    if (!user) {
      return res.json({ success: false, message: "Người dùng không tồn tại" })
    }

    // Also remove from blacklist if exists
    await blacklistModel.deleteOne({ userId })

    res.json({ success: true, message: "Đã xóa người dùng thành công" })
  } catch (error) {
    console.error("Error deleting user:", error)
    res.json({ success: false, message: "Lỗi server: " + error.message })
  }
}

export {
  loginUser,
  registerUser,
  adminLogin,
  googleLogin,
  getUserProfile,
  updateUserProfile,
  getAllUsers,
  blockUser,
  unblockUser,
  getBlacklist,
  deleteUser,
}
