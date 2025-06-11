import mongoose from "mongoose"

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: false }, // Make password optional for Google users
    role: { type: String, enum: ["user", "admin"], default: "user" },
    cartData: { type: Object, default: {} },
    googleId: { type: String, unique: true, sparse: true }, // Add Google ID field
    avatar: { type: String }, // Add avatar field for Google profile picture
    authProvider: { type: String, enum: ["local", "google"], default: "local" }, // Track auth method
  },
  { minimize: false },
)

const userModel = mongoose.models.user || mongoose.model("user", userSchema)
export default userModel
