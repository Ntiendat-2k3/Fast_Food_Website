import voucherModel from "../models/voucherModel.js"

// Thêm voucher mới
const addVoucher = async (req, res) => {
  try {
    const newVoucher = new voucherModel(req.body)
    await newVoucher.save()
    res.json({ success: true, message: "Thêm voucher thành công" })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: "Lỗi khi thêm voucher" })
  }
}

// Lấy danh sách voucher
const listVouchers = async (req, res) => {
  try {
    const vouchers = await voucherModel.find({})
    res.json({ success: true, data: vouchers })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: "Lỗi khi lấy danh sách voucher" })
  }
}

// Cập nhật voucher
const updateVoucher = async (req, res) => {
  try {
    const { id, ...updateData } = req.body
    await voucherModel.findByIdAndUpdate(id, updateData)
    res.json({ success: true, message: "Cập nhật voucher thành công" })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: "Lỗi khi cập nhật voucher" })
  }
}

// Xóa voucher
const deleteVoucher = async (req, res) => {
  try {
    await voucherModel.findByIdAndDelete(req.body.id)
    res.json({ success: true, message: "Xóa voucher thành công" })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: "Lỗi khi xóa voucher" })
  }
}

// Kiểm tra và áp dụng voucher
const applyVoucher = async (req, res) => {
  try {
    const { code, orderAmount } = req.body

    // Tìm voucher theo mã
    const voucher = await voucherModel.findOne({
      code,
      isActive: true,
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() },
    })

    if (!voucher) {
      return res.json({ success: false, message: "Mã giảm giá không hợp lệ hoặc đã hết hạn" })
    }

    // Kiểm tra giới hạn sử dụng
    if (voucher.usageLimit > 0 && voucher.usageCount >= voucher.usageLimit) {
      return res.json({ success: false, message: "Mã giảm giá đã hết lượt sử dụng" })
    }

    // Kiểm tra giá trị đơn hàng tối thiểu
    if (orderAmount < voucher.minOrderValue) {
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

    // Cập nhật số lần sử dụng
    await voucherModel.findByIdAndUpdate(voucher._id, { $inc: { usageCount: 1 } })

    res.json({
      success: true,
      message: "Áp dụng mã giảm giá thành công",
      data: {
        discountAmount,
        voucherInfo: voucher,
      },
    })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: "Lỗi khi áp dụng mã giảm giá" })
  }
}

export { addVoucher, listVouchers, updateVoucher, deleteVoucher, applyVoucher }
