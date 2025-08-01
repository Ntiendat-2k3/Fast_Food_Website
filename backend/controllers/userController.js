import userModel from "../models/userModel.js"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import validator from "validator"
import { sendVerificationEmail, sendPasswordResetCode } from "../utils/emailSender.js"

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
      // Ensure Google users are marked as verified
      if (!user.isVerified) {
        user.isVerified = true
        await user.save()
      }
    } else {
      // Create new user
      user = new userModel({
        name,
        email,
        googleId,
        avatar: picture,
        password: await bcrypt.hash(Math.random().toString(36), 10), // Random password for Google users
        role: "user",
        isVerified: true, // Google users are automatically verified
        authProvider: "google", // Set auth provider
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

// Login user (now by name)
const loginUser = async (req, res) => {
  const { name, password } = req.body // Changed from email to name
  try {
    const user = await userModel.findOne({ name }) // Find by name

    if (!user) {
      return res.json({ success: false, message: "Tên đăng nhập không tồn tại" })
    }

    // Check if user is verified (only for local accounts)
    if (user.authProvider === "local" && !user.isVerified) {
      return res.json({
        success: false,
        message: "Tài khoản chưa được xác minh. Vui lòng kiểm tra email của bạn để xác minh.",
      })
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
  const { email, password } = req.body // Admin login still uses email for simplicity

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

    // For admin/staff accounts, skip email verification requirement
    // This allows admins to login even if they haven't verified their email
    // You can remove this if you want to enforce email verification for admins too

    const isMatch = await bcrypt.compare(password, user.password)
    console.log("Password match:", isMatch)

    if (!isMatch) {
      return res.json({ success: false, message: "Mật khẩu không đúng" })
    }

    // Auto-verify admin/staff accounts on successful login if not already verified
    if (!user.isVerified) {
      user.isVerified = true
      await user.save()
      console.log("Auto-verified admin/staff account")
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
    // Check if email already exists
    const emailExists = await userModel.findOne({ email })
    if (emailExists) {
      if (emailExists.isVerified) {
        return res.json({ success: false, message: "Email đã được sử dụng bởi một tài khoản khác." })
      } else {
        // If email exists but not verified, resend verification code
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString() // 6-digit code
        const verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes from now

        emailExists.verificationCode = verificationCode
        emailExists.verificationCodeExpires = verificationCodeExpires
        await emailExists.save()

        await sendVerificationEmail(email, verificationCode)
        return res.json({
          success: true, // Still success, but requires verification
          message: "Email đã tồn tại nhưng chưa xác minh. Mã xác minh mới đã được gửi đến email của bạn.",
          verificationRequired: true,
        })
      }
    }

    // Check if username already exists
    const nameExists = await userModel.findOne({ name })
    if (nameExists) {
      return res.json({ success: false, message: "Tên đăng nhập đã tồn tại. Vui lòng chọn tên khác." })
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

    // Generate verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString() // 6-digit code
    const verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes from now

    // For admin/staff accounts, auto-verify them
    const isAdminOrStaff = ["admin", "staff"].includes(role)

    const newUser = new userModel({
      name: name,
      email: email,
      password: hashedPassword,
      role: role,
      isVerified: isAdminOrStaff, // Auto-verify admin/staff accounts
      verificationCode: isAdminOrStaff ? undefined : verificationCode,
      verificationCodeExpires: isAdminOrStaff ? undefined : verificationCodeExpires,
      authProvider: "local", // Set auth provider
    })

    const user = await newUser.save()

    // Send verification email only for regular users
    if (!isAdminOrStaff) {
      await sendVerificationEmail(email, verificationCode)
    }

    res.json({
      success: true,
      message: isAdminOrStaff
        ? "Tài khoản admin/staff đã được tạo thành công và tự động xác minh."
        : "Mã xác minh đã được gửi đến email của bạn. Vui lòng kiểm tra email để xác minh tài khoản.",
      verificationRequired: !isAdminOrStaff,
    })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: "Lỗi server" })
  }
}

// Verify email
const verifyEmail = async (req, res) => {
  const { email, code } = req.body
  try {
    const user = await userModel.findOne({ email })

    if (!user) {
      return res.json({ success: false, message: "Người dùng không tồn tại." })
    }

    if (user.isVerified) {
      return res.json({ success: false, message: "Tài khoản đã được xác minh." })
    }

    if (user.verificationCode !== code) {
      return res.json({ success: false, message: "Mã xác minh không hợp lệ." })
    }

    if (user.verificationCodeExpires < new Date()) {
      return res.json({ success: false, message: "Mã xác minh đã hết hạn. Vui lòng yêu cầu mã mới." })
    }

    user.isVerified = true
    user.verificationCode = undefined // Clear code after verification
    user.verificationCodeExpires = undefined // Clear expiry after verification
    await user.save()

    res.json({ success: true, message: "Xác minh email thành công. Bạn có thể đăng nhập." })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: "Lỗi xác minh email." })
  }
}

// New: Forgot Password (sends a code to email)
const forgotPassword = async (req, res) => {
  const { email } = req.body
  try {
    const user = await userModel.findOne({ email })

    if (!user) {
      return res.json({ success: false, message: "Email không tồn tại trong hệ thống." })
    }

    // Generate a new verification code for password reset
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString() // 6-digit code
    const verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes from now

    user.verificationCode = verificationCode
    user.verificationCodeExpires = verificationCodeExpires
    await user.save()

    await sendPasswordResetCode(email, verificationCode)

    res.json({ success: true, message: "Mã đặt lại mật khẩu đã được gửi đến email của bạn." })
  } catch (error) {
    console.error("Forgot password error:", error)
    res.json({ success: false, message: "Lỗi khi yêu cầu đặt lại mật khẩu." })
  }
}

// New: Reset Password (uses code from email)
const resetPassword = async (req, res) => {
  const { email, code, newPassword } = req.body
  try {
    const user = await userModel.findOne({ email })

    if (!user) {
      return res.json({ success: false, message: "Người dùng không tồn tại." })
    }

    if (user.verificationCode !== code) {
      return res.json({ success: false, message: "Mã xác minh không hợp lệ." })
    }

    if (user.verificationCodeExpires < new Date()) {
      return res.json({ success: false, message: "Mã xác minh đã hết hạn. Vui lòng yêu cầu mã mới." })
    }

    if (newPassword.length < 8) {
      return res.json({ success: false, message: "Mật khẩu mới phải có ít nhất 8 ký tự." })
    }

    const salt = await bcrypt.genSalt(10)
    user.password = await bcrypt.hash(newPassword, salt)
    user.verificationCode = undefined // Clear code after reset
    user.verificationCodeExpires = undefined // Clear expiry after reset

    // Auto-verify the user if they successfully reset password
    if (!user.isVerified) {
      user.isVerified = true
    }

    await user.save()

    res.json({ success: true, message: "Mật khẩu của bạn đã được đặt lại thành công." })
  } catch (error) {
    console.error("Reset password error:", error)
    res.json({ success: false, message: "Lỗi khi đặt lại mật khẩu." })
  }
}

// New: Change Password (for logged-in users)
const changePassword = async (req, res) => {
  const { currentPassword, newPassword, confirmNewPassword } = req.body
  try {
    const user = await userModel.findById(req.userId)

    if (!user) {
      return res.json({ success: false, message: "Người dùng không tồn tại." })
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password)
    if (!isMatch) {
      return res.json({ success: false, message: "Mật khẩu hiện tại không đúng." })
    }

    if (newPassword !== confirmNewPassword) {
      return res.json({ success: false, message: "Mật khẩu mới và xác nhận mật khẩu không khớp." })
    }

    if (newPassword.length < 8) {
      return res.json({ success: false, message: "Mật khẩu mới phải có ít nhất 8 ký tự." })
    }

    const salt = await bcrypt.genSalt(10)
    user.password = await bcrypt.hash(newPassword, salt)
    await user.save()

    res.json({ success: true, message: "Mật khẩu đã được thay đổi thành công." })
  } catch (error) {
    console.error("Change password error:", error)
    res.json({ success: false, message: "Lỗi khi thay đổi mật khẩu." })
  }
}

// Get user profile
const getUserProfile = async (req, res) => {
  try {
    const user = await userModel.findById(req.userId).select("-password -verificationCode -verificationCodeExpires") // Exclude sensitive fields
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

    const { role } = req.query // Get role from query parameters
    const query = {}

    if (role) {
      query.role = role // Filter by role if provided
    }

    console.log("Fetching users from database with query:", query)
    const users = await userModel
      .find(query)
      .select("-password -verificationCode -verificationCodeExpires")
      .sort({ createdAt: -1 }) // Exclude sensitive fields
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
  deleteUser,
  verifyEmail,
  forgotPassword,
  resetPassword,
  changePassword, // New export
}
