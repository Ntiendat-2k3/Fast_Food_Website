import addressModel from "../models/addressModel.js"

// Get all addresses for a user
const getUserAddresses = async (req, res) => {
  try {
    const userId = req.user._id
    const addresses = await addressModel.find({ userId }).sort({ isDefault: -1, updatedAt: -1 })

    res.json({ success: true, data: addresses })
  } catch (error) {
    console.error("Error in getUserAddresses:", error)
    res.json({ success: false, message: "Lỗi khi lấy danh sách địa chỉ" })
  }
}

// Add a new address
const addAddress = async (req, res) => {
  try {
    const userId = req.user._id
    const { name, phone, street, isDefault } = req.body

    // Check if user has reached the limit of 3 addresses
    const canAddMore = await addressModel.checkAddressLimit(userId)
    if (!canAddMore) {
      return res.json({
        success: false,
        message: "Bạn chỉ có thể lưu tối đa 3 địa chỉ. Vui lòng xóa địa chỉ cũ trước khi thêm mới.",
      })
    }

    // If this is set as default, unset any existing default
    if (isDefault) {
      await addressModel.updateMany({ userId }, { isDefault: false })
    }

    // If this is the first address, make it default
    const addressCount = await addressModel.countDocuments({ userId })
    const shouldBeDefault = addressCount === 0 || isDefault

    const newAddress = new addressModel({
      userId,
      name,
      phone,
      street,
      isDefault: shouldBeDefault,
    })

    await newAddress.save()

    // Get all addresses to return to client
    const addresses = await addressModel.find({ userId }).sort({ isDefault: -1, updatedAt: -1 })

    res.json({
      success: true,
      message: "Thêm địa chỉ thành công",
      data: addresses,
    })
  } catch (error) {
    console.error("Error in addAddress:", error)
    res.json({ success: false, message: "Lỗi khi thêm địa chỉ" })
  }
}

// Update an address
const updateAddress = async (req, res) => {
  try {
    const userId = req.user._id
    const { addressId, name, phone, street, isDefault } = req.body

    // Check if address exists and belongs to user
    const address = await addressModel.findOne({
      _id: addressId,
      userId,
    })

    if (!address) {
      return res.json({ success: false, message: "Địa chỉ không tồn tại hoặc không thuộc về bạn" })
    }

    // If setting as default, unset any existing default
    if (isDefault) {
      await addressModel.updateMany({ userId }, { isDefault: false })
    }

    // Update the address
    address.name = name
    address.phone = phone
    address.street = street
    address.isDefault = isDefault

    await address.save()

    // Get all addresses to return to client
    const addresses = await addressModel.find({ userId }).sort({ isDefault: -1, updatedAt: -1 })

    res.json({
      success: true,
      message: "Cập nhật địa chỉ thành công",
      data: addresses,
    })
  } catch (error) {
    console.error("Error in updateAddress:", error)
    res.json({ success: false, message: "Lỗi khi cập nhật địa chỉ" })
  }
}

// Delete an address
const deleteAddress = async (req, res) => {
  try {
    const userId = req.user._id
    const { addressId } = req.body

    // Check if address exists and belongs to user
    const address = await addressModel.findOne({
      _id: addressId,
      userId,
    })

    if (!address) {
      return res.json({ success: false, message: "Địa chỉ không tồn tại hoặc không thuộc về bạn" })
    }

    // Delete the address
    await addressModel.deleteOne({ _id: addressId })

    // If deleted address was default, set another as default if any exist
    if (address.isDefault) {
      const remainingAddress = await addressModel.findOne({ userId })
      if (remainingAddress) {
        remainingAddress.isDefault = true
        await remainingAddress.save()
      }
    }

    // Get all addresses to return to client
    const addresses = await addressModel.find({ userId }).sort({ isDefault: -1, updatedAt: -1 })

    res.json({
      success: true,
      message: "Xóa địa chỉ thành công",
      data: addresses,
    })
  } catch (error) {
    console.error("Error in deleteAddress:", error)
    res.json({ success: false, message: "Lỗi khi xóa địa chỉ" })
  }
}

// Set an address as default
const setDefaultAddress = async (req, res) => {
  try {
    const userId = req.user._id
    const { addressId } = req.body

    // Check if address exists and belongs to user
    const address = await addressModel.findOne({
      _id: addressId,
      userId,
    })

    if (!address) {
      return res.json({ success: false, message: "Địa chỉ không tồn tại hoặc không thuộc về bạn" })
    }

    // Unset any existing default
    await addressModel.updateMany({ userId }, { isDefault: false })

    // Set this address as default
    address.isDefault = true
    await address.save()

    // Get all addresses to return to client
    const addresses = await addressModel.find({ userId }).sort({ isDefault: -1, updatedAt: -1 })

    res.json({
      success: true,
      message: "Đặt địa chỉ mặc định thành công",
      data: addresses,
    })
  } catch (error) {
    console.error("Error in setDefaultAddress:", error)
    res.json({ success: false, message: "Lỗi khi đặt địa chỉ mặc định" })
  }
}

export { getUserAddresses, addAddress, updateAddress, deleteAddress, setDefaultAddress }
