import userModel from "../models/userModel.js"
import bcrypt from "bcrypt"
import validator from "validator"

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

    // Hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Create new staff
    const newStaff = new userModel({
      name,
      email,
      password: hashedPassword,
      role: "staff",
      phone: phone || "",
      address: address || "",
      position: position || "Nhân viên",
      isActive: true,
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

    const { name, email, phone, address, position, isActive } = req.body
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

    // Update staff
    const updatedStaff = await userModel
      .findOneAndUpdate(
        { _id: staffId, role: "staff" },
        {
          name,
          email,
          phone: phone || "",
          address: address || "",
          position: position || "Nhân viên",
          isActive: isActive !== undefined ? isActive : true,
          updatedAt: new Date(),
        },
        { new: true },
      )
      .select("-password")

    if (!updatedStaff) {
      return res.json({ success: false, message: "Không tìm thấy nhân viên" })
    }

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

export { addStaff, listStaff, getStaffById, updateStaff, deleteStaff, updateStaffStatus }
