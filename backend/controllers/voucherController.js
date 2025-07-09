import voucherModel from "../models/voucherModel.js"

// Thêm voucher mới
const addVoucher = async (req, res) => {
  try {
    console.log("Adding voucher - User role:", req.userRole)
    console.log("Voucher data:", req.body)

    const newVoucher = new voucherModel(req.body)
    await newVoucher.save()

    console.log("Voucher added successfully:", newVoucher._id)
    res.json({ success: true, message: "Thêm voucher thành công" })
  } catch (error) {
    console.error("Error adding voucher:", error)
    res.json({ success: false, message: "Lỗi khi thêm voucher" })
  }
}

// Lấy danh sách voucher
const listVouchers = async (req, res) => {
  try {
    console.log("Listing vouchers - User role:", req.userRole)

    const vouchers = await voucherModel.find({}).sort({ createdAt: -1 })

    console.log(`Found ${vouchers.length} vouchers`)
    res.json({ success: true, data: vouchers })
  } catch (error) {
    console.error("Error listing vouchers:", error)
    res.json({ success: false, message: "Lỗi khi lấy danh sách voucher" })
  }
}

// Cập nhật voucher
const updateVoucher = async (req, res) => {
  try {
    console.log("Updating voucher - User role:", req.userRole)
    console.log("Update data:", req.body)

    const { id, ...updateData } = req.body

    if (!id) {
      return res.json({ success: false, message: "ID voucher không hợp lệ" })
    }

    const updatedVoucher = await voucherModel.findByIdAndUpdate(id, updateData, { new: true })

    if (!updatedVoucher) {
      return res.json({ success: false, message: "Không tìm thấy voucher" })
    }

    console.log("Voucher updated successfully:", updatedVoucher._id)
    res.json({ success: true, message: "Cập nhật voucher thành công" })
  } catch (error) {
    console.error("Error updating voucher:", error)
    res.json({ success: false, message: "Lỗi khi cập nhật voucher" })
  }
}

// Xóa voucher
const deleteVoucher = async (req, res) => {
  try {
    console.log("Deleting voucher - User role:", req.userRole)
    console.log("Voucher ID to delete:", req.body.id)

    const { id } = req.body

    if (!id) {
      return res.json({ success: false, message: "ID voucher không hợp lệ" })
    }

    const deletedVoucher = await voucherModel.findByIdAndDelete(id)

    if (!deletedVoucher) {
      return res.json({ success: false, message: "Không tìm thấy voucher" })
    }

    console.log("Voucher deleted successfully:", deletedVoucher._id)
    res.json({ success: true, message: "Xóa voucher thành công" })
  } catch (error) {
    console.error("Error deleting voucher:", error)
    res.json({ success: false, message: "Lỗi khi xóa voucher" })
  }
}

// Kiểm tra và áp dụng voucher
const applyVoucher = async (req, res) => {
  try {
    console.log("Applying voucher:", req.body)

    const { code, orderAmount } = req.body

    if (!code || !orderAmount) {
      return res.json({ success: false, message: "Thiếu thông tin mã giảm giá hoặc giá trị đơn hàng" })
    }

    // Tìm voucher theo mã
    const voucher = await voucherModel.findOne({
      code: code.toUpperCase(),
      isActive: true,
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() },
    })

    if (!voucher) {
      console.log("Voucher not found or expired:", code)
      return res.json({ success: false, message: "Mã giảm giá không hợp lệ hoặc đã hết hạn" })
    }

    // Kiểm tra giới hạn sử dụng
    if (voucher.usageLimit > 0 && voucher.usageCount >= voucher.usageLimit) {
      console.log("Voucher usage limit exceeded:", code)
      return res.json({ success: false, message: "Mã giảm giá đã hết lượt sử dụng" })
    }

    // Kiểm tra giá trị đơn hàng tối thiểu
    if (orderAmount < voucher.minOrderValue) {
      console.log("Order amount below minimum:", orderAmount, "vs", voucher.minOrderValue)
      return res.json({
        success: false,
        message: `Giá trị đơn hàng tối thiểu phải từ ${voucher.minOrderValue.toLocaleString("vi-VN")}đ`,
      })
    }

    // Tính toán số tiền giảm giá
    let discountAmount = 0
    if (voucher.discountType === "percentage") {
      discountAmount = (orderAmount * voucher.discountValue) / 100

      // Áp dụng giảm giá tối đa nếu có
      if (voucher.maxDiscountAmount && discountAmount > voucher.maxDiscountAmount) {
        discountAmount = voucher.maxDiscountAmount
      }
    } else {
      discountAmount = voucher.discountValue
    }

    // Đảm bảo số tiền giảm không vượt quá giá trị đơn hàng
    if (discountAmount > orderAmount) {
      discountAmount = orderAmount
    }

    console.log("Voucher applied successfully:", {
      code,
      discountAmount,
      orderAmount,
    })

    res.json({
      success: true,
      message: "Áp dụng mã giảm giá thành công",
      data: {
        discountAmount,
        voucherInfo: {
          _id: voucher._id,
          code: voucher.code,
          discountType: voucher.discountType,
          discountValue: voucher.discountValue,
          description: voucher.description,
        },
      },
    })
  } catch (error) {
    console.error("Error applying voucher:", error)
    res.json({ success: false, message: "Lỗi khi áp dụng mã giảm giá" })
  }
}

// Xác nhận sử dụng voucher (gọi khi đơn hàng được tạo thành công)
const confirmVoucherUsage = async (req, res) => {
  try {
    const { voucherId } = req.body

    if (!voucherId) {
      return res.json({ success: false, message: "ID voucher không hợp lệ" })
    }

    // Cập nhật số lần sử dụng
    const updatedVoucher = await voucherModel.findByIdAndUpdate(voucherId, { $inc: { usageCount: 1 } }, { new: true })

    if (!updatedVoucher) {
      return res.json({ success: false, message: "Không tìm thấy voucher" })
    }

    console.log("Voucher usage confirmed:", voucherId)
    res.json({ success: true, message: "Xác nhận sử dụng voucher thành công" })
  } catch (error) {
    console.error("Error confirming voucher usage:", error)
    res.json({ success: false, message: "Lỗi khi xác nhận sử dụng voucher" })
  }
}

// Lấy danh sách voucher đang hoạt động (cho frontend)
const getActiveVouchers = async (req, res) => {
  try {
    const currentDate = new Date()
    const vouchers = await voucherModel
      .find({
        isActive: true,
        startDate: { $lte: currentDate },
        endDate: { $gte: currentDate },
        $or: [
          { usageLimit: 0 }, // Không giới hạn
          { $expr: { $lt: ["$usageCount", "$usageLimit"] } }, // Còn lượt sử dụng
        ],
      })
      .select("code discountType discountValue minOrderValue maxDiscountAmount description")
      .sort({ createdAt: -1 })

    console.log(`Found ${vouchers.length} active vouchers`)
    res.json({ success: true, data: vouchers })
  } catch (error) {
    console.error("Error getting active vouchers:", error)
    res.json({ success: false, message: "Lỗi khi lấy danh sách voucher" })
  }
}

export { addVoucher, listVouchers, updateVoucher, deleteVoucher, applyVoucher, getActiveVouchers, confirmVoucherUsage }
