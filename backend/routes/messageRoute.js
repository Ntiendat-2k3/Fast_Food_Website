import express from "express"
import {
  sendMessage,
  getUserMessages,
  getAllMessages,
  getUserConversation,
  markAsRead,
} from "../controllers/messageController.js"
import { requireSignIn, isAdmin } from "../middleware/auth.js"
import multer from "multer"
import path from "path"
import { fileURLToPath } from "url"
import fs from "fs"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const router = express.Router()

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "..", "uploads", "chat")

    // Create the directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true })
    }

    cb(null, uploadPath)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    cb(null, uniqueSuffix + path.extname(file.originalname))
  },
})

const upload = multer({ storage: storage })

// Routes
router.post("/send", requireSignIn, upload.single("image"), sendMessage)
router.get("/user", requireSignIn, getUserMessages)
router.get("/all", requireSignIn, isAdmin, getAllMessages)
router.get("/conversation/:userId", requireSignIn, isAdmin, getUserConversation)
router.post("/read", requireSignIn, markAsRead)

export default router
