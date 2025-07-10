import mongoose from "mongoose"

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: false }, // Make password optional for Google users
    role: { type: String, enum: ["user", "staff", "admin"], default: "user" }, // Added staff role
    cartData: { type: Object, default: {} },
    googleId: { type: String, unique: true, sparse: true }, // Add Google ID field
    avatar: { type: String }, // Add avatar field for Google profile picture
    authProvider: { type: String, enum: ["local", "google"], default: "local" }, // Track auth method

    // Staff-specific fields
    phone: { type: String, default: "" },
    address: { type: String, default: "" },
    position: { type: String, default: "Nhân viên" }, // Job position
    isActive: { type: Boolean, default: true }, // Active status
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "user" }, // Who created this staff
    updatedAt: { type: Date, default: Date.now },
  },
  { minimize: false, timestamps: true },
)

// Index for better performance
userSchema.index({ email: 1 })
userSchema.index({ role: 1 })
userSchema.index({ isActive: 1 })

const userModel = mongoose.models.user || mongoose.model("user", userSchema)
export default userModel
