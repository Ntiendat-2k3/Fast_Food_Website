import mongoose from "mongoose"

const addressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    street: {
      type: String,
      required: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
)

// Ensure a user can only have 3 addresses maximum
addressSchema.statics.checkAddressLimit = async function (userId) {
  const count = await this.countDocuments({ userId })
  return count < 3
}

const addressModel = mongoose.models.address || mongoose.model("address", addressSchema)
export default addressModel
