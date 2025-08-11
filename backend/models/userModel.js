import mongoose from "mongoose"

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true }, // Changed to unique: true for username
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // Required for local users
    role: { type: String, enum: ["user", "staff", "admin"], default: "user" },
    // cartData: { type: Object, default: {} },
    googleId: { type: String, unique: true, sparse: true },
    avatar: { type: String },
    authProvider: { type: String, enum: ["local", "google"], default: "local" },

    phone: { type: String, default: "" },
    address: { type: String, default: "" },
    position: { type: String, default: "Nhân viên" },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    updatedAt: { type: Date, default: Date.now },

    isVerified: { type: Boolean, default: false },
    verificationCode: { type: String },
    verificationCodeExpires: { type: Date },
  },
  { minimize: false, timestamps: true },
)

userSchema.index({ email: 1 })
userSchema.index({ name: 1 })
userSchema.index({ role: 1 })
userSchema.index({ isActive: 1 })

const userModel = mongoose.models.user || mongoose.model("user", userSchema)
export default userModel
