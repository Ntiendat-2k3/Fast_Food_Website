import voucherModel from "../models/voucherModel.js"

// Thêm voucher mới (Admin/Staff only)
const addVoucher = async (req, res) => {
  try {
    const { code, discount, minOrderAmount, maxDiscount, expiryDate, usageLimit, description } = req.body
    const createdBy = req.body.userId

    // Validation
    if (!code || !discount || !expiryDate) {
      return res.json({ success: false, message: "Code, discount, and expiry date are required" })
    }

    // Check if voucher code already exists
    const existingVoucher = await voucherModel.findOne({ code })
    if (existingVoucher) {
      return res.json({ success: false, message: "Voucher code already exists" })
    }

    // Validate discount
    if (discount <= 0 || discount > 100) {
      return res.json({ success: false, message: "Discount must be between 1 and 100" })
    }

    // Validate expiry date
    if (new Date(expiryDate) <= new Date()) {
      return res.json({ success: false, message: "Expiry date must be in the future" })
    }

    const voucher = new voucherModel({
      code: code.toUpperCase(),
      discount,
      minOrderAmount: minOrderAmount || 0,
      maxDiscount: maxDiscount || null,
      expiryDate,
      usageLimit: usageLimit || null,
      description: description || "",
      createdBy,
      isActive: true,
    })

    await voucher.save()

    console.log(`Voucher ${code} created by user ${createdBy}`)
    res.json({ success: true, message: "Voucher added successfully", voucher })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: "Error adding voucher" })
  }
}

// Lấy danh sách voucher (Admin/Staff only)
const listVouchers = async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    const vouchers = await voucherModel
      .find({})
      .populate("createdBy", "name role")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })

    const total = await voucherModel.countDocuments({})

    res.json({
      success: true,
      vouchers,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        count: vouchers.length,
        totalVouchers: total,
      },
    })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: "Error fetching vouchers" })
  }
}

// Lấy danh sách voucher đang hoạt động
const getActiveVouchers = async (req, res) => {
  try {
    const vouchers = await voucherModel
      .find({
        isActive: true,
        expiryDate: { $gt: new Date() },
        $or: [{ usageLimit: null }, { $expr: { $lt: ["$usedCount", "$usageLimit"] } }],
      })
      .select("code discount minOrderAmount maxDiscount expiryDate description")

    res.json({ success: true, vouchers })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: "Error fetching active vouchers" })
  }
}

// Cập nhật voucher (Admin/Staff only)
const updateVoucher = async (req, res) => {
  try {
    const { id } = req.params
    const { code, discount, minOrderAmount, maxDiscount, expiryDate, usageLimit, description, isActive } = req.body
    const updatedBy = req.body.userId

    if (!id) {
      return res.json({ success: false, message: "Voucher ID is required" })
    }

    const voucher = await voucherModel.findById(id)
    if (!voucher) {
      return res.json({ success: false, message: "Voucher not found" })
    }

    // Check if new code already exists (excluding current voucher)
    if (code && code !== voucher.code) {
      const existingVoucher = await voucherModel.findOne({ code, _id: { $ne: id } })
      if (existingVoucher) {
        return res.json({ success: false, message: "Voucher code already exists" })
      }
    }

    // Validate discount
    if (discount && (discount <= 0 || discount > 100)) {
      return res.json({ success: false, message: "Discount must be between 1 and 100" })
    }

    // Validate expiry date
    if (expiryDate && new Date(expiryDate) <= new Date()) {
      return res.json({ success: false, message: "Expiry date must be in the future" })
    }

    const updateData = {}
    if (code) updateData.code = code.toUpperCase()
    if (discount) updateData.discount = discount
    if (minOrderAmount !== undefined) updateData.minOrderAmount = minOrderAmount
    if (maxDiscount !== undefined) updateData.maxDiscount = maxDiscount
    if (expiryDate) updateData.expiryDate = expiryDate
    if (usageLimit !== undefined) updateData.usageLimit = usageLimit
    if (description !== undefined) updateData.description = description
    if (isActive !== undefined) updateData.isActive = isActive
    updateData.updatedBy = updatedBy
    updateData.updatedAt = new Date()

    const updatedVoucher = await voucherModel.findByIdAndUpdate(id, updateData, { new: true })

    console.log(`Voucher ${updatedVoucher.code} updated by user ${updatedBy}`)
    res.json({ success: true, message: "Voucher updated successfully", voucher: updatedVoucher })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: "Error updating voucher" })
  }
}

// Xóa voucher (Admin/Staff only)
const removeVoucher = async (req, res) => {
  try {
    const { id } = req.params
    const deletedBy = req.body.userId

    if (!id) {
      return res.json({ success: false, message: "Voucher ID is required" })
    }

    const voucher = await voucherModel.findById(id)
    if (!voucher) {
      return res.json({ success: false, message: "Voucher not found" })
    }

    await voucherModel.findByIdAndDelete(id)

    console.log(`Voucher ${voucher.code} deleted by user ${deletedBy}`)
    res.json({ success: true, message: "Voucher deleted successfully" })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: "Error deleting voucher" })
  }
}

// Kiểm tra và áp dụng voucher
const applyVoucher = async (req, res) => {
  try {
    const { code, orderAmount } = req.body
    const userId = req.body.userId

    if (!code || !orderAmount) {
      return res.json({ success: false, message: "Voucher code and order amount are required" })
    }

    const voucher = await voucherModel.findOne({ code: code.toUpperCase() })
    if (!voucher) {
      return res.json({ success: false, message: "Invalid voucher code" })
    }

    // Check if voucher is active
    if (!voucher.isActive) {
      return res.json({ success: false, message: "Voucher is not active" })
    }

    // Check if voucher is expired
    if (new Date() > voucher.expiryDate) {
      return res.json({ success: false, message: "Voucher has expired" })
    }

    // Check minimum order amount
    if (orderAmount < voucher.minOrderAmount) {
      return res.json({
        success: false,
        message: `Minimum order amount is $${voucher.minOrderAmount}`,
      })
    }

    // Check usage limit
    if (voucher.usageLimit && voucher.usedCount >= voucher.usageLimit) {
      return res.json({ success: false, message: "Voucher usage limit reached" })
    }

    // Calculate discount
    let discountAmount = (orderAmount * voucher.discount) / 100
    if (voucher.maxDiscount && discountAmount > voucher.maxDiscount) {
      discountAmount = voucher.maxDiscount
    }

    res.json({
      success: true,
      message: "Voucher applied successfully",
      voucher: {
        code: voucher.code,
        discount: voucher.discount,
        discountAmount,
        maxDiscount: voucher.maxDiscount,
      },
    })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: "Error applying voucher" })
  }
}

// Lấy thống kê voucher (Admin/Staff only)
const getVoucherStats = async (req, res) => {
  try {
    const totalVouchers = await voucherModel.countDocuments({})
    const activeVouchers = await voucherModel.countDocuments({ isActive: true })
    const expiredVouchers = await voucherModel.countDocuments({ expiryDate: { $lt: new Date() } })
    const usedVouchers = await voucherModel.countDocuments({ usedCount: { $gt: 0 } })

    res.json({
      success: true,
      stats: {
        total: totalVouchers,
        active: activeVouchers,
        expired: expiredVouchers,
        used: usedVouchers,
      },
    })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: "Error fetching voucher statistics" })
  }
}

export { addVoucher, listVouchers, getActiveVouchers, updateVoucher, removeVoucher, applyVoucher, getVoucherStats }
