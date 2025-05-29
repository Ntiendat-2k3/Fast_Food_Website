import mongoose from "mongoose"

const blacklistSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
  reason: { type: String, required: true },
  blockedAt: { type: Date, default: Date.now },
  blockedBy: { type: String, required: true },
})

const blacklistModel = mongoose.models.blacklist || mongoose.model("blacklist", blacklistSchema)
export default blacklistModel
