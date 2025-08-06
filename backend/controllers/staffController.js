import userModel from "../models/userModel.js"
import bcrypt from "bcrypt"
import validator from "validator"
import fs from "fs"
import { sendStaffNotification } from "../utils/emailSender.js"

// Add new staff member
const addStaff = async (req, res) => {
  try {
    console.log("=== ADD STAFF ===")
    console.log("Request by admin:", req.user?.name)
    console.log("Staff data:", req.body)

    const { name, email, password, phone, address, position } = req.body

    // Validation
    if (!name || !email || !password) {
      return res.json({ success: false, message: "Vui lòng điền đầy đủ thông tin bắt buộc" })
    }

    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: "Email không hợp lệ" })
    }

    if (password.length < 6) {
      return res.json({ success: false, message: "Mật khẩu phải có ít nhất 6 ký tự" })
    }

    // Check if email already exists
    const existingUser = await userModel.findOne({ email })
    if (existingUser) {
      return res.json({ success: false, message: "Email đã được sử dụng" })
    }

    // Check if name already exists
    const existingName = await userModel.findOne({ name })
    if (existingName) {
      return res.json({ success: false, message: "Tên người dùng đã được sử dụng" })
    }

    // Hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Handle avatar upload
    let avatarFilename = ""
    if (req.file) {
      avatarFilename = req.file.filename
    }

    // Create new staff
    const newStaff = new userModel({
      name,
      email,
      password: hashedPassword,
      role: "staff",
      phone: phone || "",
      address: address || "",
      position: "Nhân viên", // Fixed position
      isActive: true,
      avatar: avatarFilename,
      createdBy: req.userId,
    })

    const savedStaff = await newStaff.save()
    console.log("Staff created successfully:", savedStaff._id)

    res.json({
      success: true,
      message: "Thêm nhân viên thành công",
      data: {
        id: savedStaff._id,
        name: savedStaff.name,
        email: savedStaff.email,
        role: savedStaff.role,
        phone: savedStaff.phone,
        address: savedStaff.address,
        position: savedStaff.position,
        isActive: savedStaff.isActive,
        avatar: savedStaff.avatar,
        createdAt: savedStaff.createdAt,
      },
    })
  } catch (error) {
    console.error("Error adding staff:", error)
    res.json({ success: false, message: "Lỗi server: " + error.message })
  }
}

// Get all staff members
const listStaff = async (req, res) => {
  try {
    console.log("=== LIST STAFF ===")
    console.log("Request by admin:", req.user?.name)

    const { page = 1, limit = 10, search = "", status = "all" } = req.query

    // Build query
    const query = { role: "staff" }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { position: { $regex: search, $options: "i" } },
      ]
    }

    if (status !== "all") {
      query.isActive = status === "active"
    }

    const skip = (Number.parseInt(page) - 1) * Number.parseInt(limit)

    const staff = await userModel
      .find(query)
      .select("-password")
      .populate("createdBy", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number.parseInt(limit))

    const total = await userModel.countDocuments(query)

    console.log(`Found ${staff.length} staff members`)

    res.json({
      success: true,
      data: staff,
      pagination: {
        current: Number.parseInt(page),
        total: Math.ceil(total / Number.parseInt(limit)),
        count: staff.length,
        totalRecords: total,
      },
      message: `Tìm thấy ${total} nhân viên`,
    })
  } catch (error) {
    console.error("Error listing staff:", error)
    res.json({ success: false, message: "Lỗi server: " + error.message })
  }
}

// Get staff by ID
const getStaffById = async (req, res) => {
  try {
    console.log("=== GET STAFF BY ID ===")
    console.log("Staff ID:", req.params.id)

    const staff = await userModel.findOne({ _id: req.params.id, role: "staff" }).select("-password")

    if (!staff) {
      return res.json({ success: false, message: "Không tìm thấy nhân viên" })
    }

    res.json({
      success: true,
      data: staff,
      message: "Lấy thông tin nhân viên thành công",
    })
  } catch (error) {
    console.error("Error getting staff:", error)
    res.json({ success: false, message: "Lỗi server: " + error.message })
  }
}

// Update staff
const updateStaff = async (req, res) => {
  try {
    console.log("=== UPDATE STAFF ===")
    console.log("Staff ID:", req.params.id)
    console.log("Update data:", req.body)

    const { name, email, phone, address, isActive } = req.body
    const staffId = req.params.id

    // Validation
    if (!name || !email) {
      return res.json({ success: false, message: "Tên và email là bắt buộc" })
    }

    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: "Email không hợp lệ" })
    }

    // Check if email exists for other users
    const existingUser = await userModel.findOne({ email, _id: { $ne: staffId } })
    if (existingUser) {
      return res.json({ success: false, message: "Email đã được sử dụng bởi người khác" })
    }

    // Check if name exists for other users
    const existingName = await userModel.findOne({ name, _id: { $ne: staffId } })
    if (existingName) {
      return res.json({ success: false, message: "Tên người dùng đã được sử dụng bởi người khác" })
    }

    // Get current staff data
    const currentStaff = await userModel.findOne({ _id: staffId, role: "staff" })
    if (!currentStaff) {
      return res.json({ success: false, message: "Không tìm thấy nhân viên" })
    }

    // Handle avatar upload
    let avatarFilename = currentStaff.avatar
    if (req.file) {
      // Delete old avatar if exists
      if (currentStaff.avatar) {
        try {
          fs.unlinkSync(`uploads/${currentStaff.avatar}`)
        } catch (error) {
          console.log("Error deleting old avatar:", error)
        }
      }
      avatarFilename = req.file.filename
    }

    // Update staff
    const updatedStaff = await userModel
      .findOneAndUpdate(
        { _id: staffId, role: "staff" },
        {
          name,
          email,
          phone: phone || "",
          address: address || "",
          position: "Nhân viên", // Fixed position
          isActive: isActive !== undefined ? isActive : true,
          avatar: avatarFilename,
          updatedAt: new Date(),
        },
        { new: true },
      )
      .select("-password")

    console.log("Staff updated successfully:", updatedStaff._id)

    res.json({
      success: true,
      data: updatedStaff,
      message: "Cập nhật thông tin nhân viên thành công",
    })
  } catch (error) {
    console.error("Error updating staff:", error)
    res.json({ success: false, message: "Lỗi server: " + error.message })
  }
}

// Delete staff
const deleteStaff = async (req, res) => {
  try {
    console.log("=== DELETE STAFF ===")
    console.log("Staff ID:", req.body.id)

    const { id } = req.body

    if (!id) {
      return res.json({ success: false, message: "ID nhân viên là bắt buộc" })
    }

    const deletedStaff = await userModel.findOneAndDelete({ _id: id, role: "staff" })

    if (!deletedStaff) {
      return res.json({ success: false, message: "Không tìm thấy nhân viên" })
    }

    // Delete avatar file if exists
    if (deletedStaff.avatar) {
      try {
        fs.unlinkSync(`uploads/${deletedStaff.avatar}`)
      } catch (error) {
        console.log("Error deleting avatar file:", error)
      }
    }

    console.log("Staff deleted successfully:", deletedStaff._id)

    res.json({
      success: true,
      message: "Xóa nhân viên thành công",
    })
  } catch (error) {
    console.error("Error deleting staff:", error)
    res.json({ success: false, message: "Lỗi server: " + error.message })
  }
}

// Update staff status (active/inactive)
const updateStaffStatus = async (req, res) => {
  try {
    console.log("=== UPDATE STAFF STATUS ===")
    console.log("Request data:", req.body)

    const { id, isActive } = req.body

    if (!id || isActive === undefined) {
      return res.json({ success: false, message: "ID và trạng thái là bắt buộc" })
    }

    const updatedStaff = await userModel
      .findOneAndUpdate({ _id: id, role: "staff" }, { isActive }, { new: true })
      .select("-password")

    if (!updatedStaff) {
      return res.json({ success: false, message: "Không tìm thấy nhân viên" })
    }

    console.log("Staff status updated:", updatedStaff._id, "Active:", isActive)

    res.json({
      success: true,
      data: updatedStaff,
      message: `${isActive ? "Kích hoạt" : "Vô hiệu hóa"} nhân viên thành công`,
    })
  } catch (error) {
    console.error("Error updating staff status:", error)
    res.json({ success: false, message: "Lỗi server: " + error.message })
  }
}

// Send notification to staff
const sendNotificationToStaff = async (req, res) => {
  try {
    console.log("=== SEND NOTIFICATION TO STAFF ===")
    console.log("Request data:", req.body)

    const { staffId, title, message, type = "info" } = req.body

    if (!staffId || !title || !message) {
      return res.json({ success: false, message: "Thiếu thông tin bắt buộc" })
    }

    // Get staff info
    const staff = await userModel.findOne({ _id: staffId, role: "staff" }).select("-password")
    if (!staff) {
      return res.json({ success: false, message: "Không tìm thấy nhân viên" })
    }

    if (!staff.isActive) {
      return res.json({ success: false, message: "Nhân viên đã bị vô hiệu hóa" })
    }

    // Send email notification
    await sendStaffNotification(staff.email, staff.name, title, message, type)

    console.log(`Notification sent to staff: ${staff.email}`)

    res.json({
      success: true,
      message: `Đã gửi thông báo đến ${staff.name} (${staff.email})`,
    })
  } catch (error) {
    console.error("Error sending notification:", error)
    res.json({ success: false, message: "Lỗi server: " + error.message })
  }
}

export {
  addStaff,
  listStaff,
  getStaffById,
  updateStaff,
  deleteStaff,
  updateStaffStatus,
  sendNotificationToStaff
}
