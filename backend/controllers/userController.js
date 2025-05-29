import userModel from "../models/userModel.js"
import blacklistModel from "../models/blacklistModel.js"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import validator from "validator"
import mongoose from "mongoose" // Import mongoose

// Get user profile
const getUserProfile = async (req, res) => {
  try {
    // The user ID is available from the auth middleware
    const userId = req.user._id

    // Find the user by ID but exclude the password
    const user = await userModel.findById(userId).select("-password")

    if (!user) {
      return res.json({ success: false, message: "User not found" })
    }

    res.json({ success: true, user })
  } catch (error) {
    console.error("Error in getUserProfile:", error)
    res.json({ success: false, message: "Error retrieving user profile" })
  }
}

// Get all users (for admin)
const getAllUsers = async (req, res) => {
  try {
    // Check if the requesting user is an admin
    if (req.user.role !== "admin") {
      return res.json({ success: false, message: "Access denied. Admin privileges required." })
    }

    // Find all users but exclude passwords
    const users = await userModel.find({}).select("-password")

    res.json({ success: true, data: users })
  } catch (error) {
    console.error("Error in getAllUsers:", error)
    res.json({ success: false, message: "Error retrieving users" })
  }
}

// login user
const loginUser = async (req, res) => {
  const { email, password } = req.body
  try {
    const user = await userModel.findOne({ email })

    if (!user) {
      return res.json({ success: false, message: "User doesn't exist." })
    }

    // Check if user is blacklisted
    const isBlacklisted = await blacklistModel.findOne({ userId: user._id })
    if (isBlacklisted) {
      return res.json({
        success: false,
        message: "Tài khoản của bạn đã bị chặn. Lý do: " + isBlacklisted.reason,
      })
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
      return res.json({ success: false, message: "Invalid credentials" })
    }

    const token = createToken(user._id)

    // Return user data (excluding password) along with the token
    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    }

    res.json({ success: true, token, user: userData })
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
      return res.json({ success: false, message: "User doesn't exist." })
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
      return res.json({ success: false, message: "Invalid credentials" })
    }

    // Check if user has admin role
    if (user.role !== "admin") {
      return res.json({ success: false, message: "Access denied. Admin privileges required." })
    }

    const token = createToken(user._id)

    // Return user data (excluding password) along with the token
    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    }

    res.json({ success: true, token, user: userData })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: "Error" })
  }
}

const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET)
}

// register user
const registerUser = async (req, res) => {
  const { name, password, email, role } = req.body
  try {
    //checking if user already exists
    const exists = await userModel.findOne({ email })
    if (exists) {
      return res.json({ success: false, message: "User already exists." })
    }

    // validating email format & strong password
    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: "Please enter a valid email." })
    }

    if (password.length < 8) {
      return res.json({ success: false, message: "Please enter a strong password." })
    }

    // hashing user password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    const newUser = new userModel({
      name: name,
      email: email,
      password: hashedPassword,
      role: role || "user", // Default to 'user' if not specified
    })

    const user = await newUser.save()
    const token = createToken(user._id)

    // Return user data (excluding password) along with the token
    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    }

    res.json({ success: true, token, user: userData })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: "Error" })
  }
}

// Block a user (add to blacklist)
const blockUser = async (req, res) => {
  try {
    const { userId, reason } = req.body

    console.log("Block user request received:", { userId, reason })

    // Check if the requesting user is an admin
    if (req.user.role !== "admin") {
      return res.json({ success: false, message: "Access denied. Admin privileges required." })
    }

    // Validate userId
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      console.error("Invalid userId:", userId)
      return res.json({ success: false, message: "ID người dùng không hợp lệ" })
    }

    // Check if user exists
    const user = await userModel.findById(userId)
    if (!user) {
      console.error("User not found with ID:", userId)
      return res.json({ success: false, message: "Không tìm thấy người dùng" })
    }

    // Check if user is already blacklisted
    const existingBlacklist = await blacklistModel.findOne({ userId })
    if (existingBlacklist) {
      console.error("User already blacklisted:", userId)
      return res.json({ success: false, message: "Người dùng này đã bị chặn trước đó" })
    }

    console.log("Creating blacklist entry for user:", user.name, userId)

    // Create new blacklist entry
    const newBlacklist = new blacklistModel({
      userId,
      reason,
      blockedBy: req.user.name || "Admin",
    })

    await newBlacklist.save()
    console.log("User successfully blacklisted:", user.name, userId)

    res.json({ success: true, message: "Đã chặn người dùng thành công" })
  } catch (error) {
    console.error("Error in blockUser:", error)
    res.json({ success: false, message: "Lỗi khi chặn người dùng" })
  }
}

// Unblock a user (remove from blacklist)
const unblockUser = async (req, res) => {
  try {
    const { blacklistId } = req.body

    // Check if the requesting user is an admin
    if (req.user.role !== "admin") {
      return res.json({ success: false, message: "Access denied. Admin privileges required." })
    }

    // Validate blacklistId
    if (!blacklistId || !mongoose.Types.ObjectId.isValid(blacklistId)) {
      return res.json({ success: false, message: "ID không hợp lệ" })
    }

    // Remove from blacklist
    const result = await blacklistModel.findByIdAndDelete(blacklistId)

    if (!result) {
      return res.json({ success: false, message: "Không tìm thấy bản ghi trong danh sách đen" })
    }

    res.json({ success: true, message: "Đã bỏ chặn người dùng thành công" })
  } catch (error) {
    console.error("Error in unblockUser:", error)
    res.json({ success: false, message: "Lỗi khi bỏ chặn người dùng" })
  }
}

// Get blacklist
const getBlacklist = async (req, res) => {
  try {
    // Check if the requesting user is an admin
    if (req.user.role !== "admin") {
      return res.json({ success: false, message: "Access denied. Admin privileges required." })
    }

    // Get blacklist with user details
    const blacklist = await blacklistModel.find({}).populate("userId", "name email")

    // Format the response
    const formattedBlacklist = blacklist.map((item) => ({
      _id: item._id,
      userId: item.userId._id,
      userName: item.userId.name,
      email: item.userId.email,
      reason: item.reason,
      blockedAt: item.blockedAt,
      blockedBy: item.blockedBy,
    }))

    res.json({ success: true, data: formattedBlacklist })
  } catch (error) {
    console.error("Error in getBlacklist:", error)
    res.json({ success: false, message: "Lỗi khi lấy danh sách đen" })
  }
}

export { loginUser, registerUser, getUserProfile, adminLogin, getAllUsers, blockUser, unblockUser, getBlacklist }
