import mongoose from "mongoose"

const messageSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      default: null,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    read: {
      type: Boolean,
      default: false,
    },
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    isAutoResponse: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
)

export default mongoose.model("Message", messageSchema)
