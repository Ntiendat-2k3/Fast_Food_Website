import mongoose from "mongoose"

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["user", "admin", "staff"],
      default: "user",
    },
    cartData: { type: Object, default: {} },
    googleId: { type: String },
    avatar: { type: String },
    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },
  },
  { minimize: false },
)

const userModel = mongoose.models.user || mongoose.model("user", userSchema)

export default userModel
