import express from "express"
import multer from "multer"
import {
  addStaff,
  listStaff,
  updateStaff,
  deleteStaff,
  getStaffById,
  updateStaffStatus,
  sendNotificationToStaff,
} from "../controllers/staffController.js"
import requireSignIn, { verifyAdmin } from "../middleware/auth.js"

const staffRouter = express.Router()

// Image storage engine
const storage = multer.diskStorage({
  destination: "uploads",
  filename: (req, file, cb) => {
    return cb(null, `${Date.now()}${file.originalname}`)
  },
})

const upload = multer({ storage: storage })

staffRouter.post("/add", requireSignIn, verifyAdmin, upload.single("avatar"), addStaff)
staffRouter.get("/list", requireSignIn, verifyAdmin, listStaff)
staffRouter.get("/:id", requireSignIn, verifyAdmin, getStaffById)
staffRouter.put("/update/:id", requireSignIn, verifyAdmin, upload.single("avatar"), updateStaff)
staffRouter.post("/delete", requireSignIn, verifyAdmin, deleteStaff)
staffRouter.post("/update-status", requireSignIn, verifyAdmin, updateStaffStatus)
staffRouter.post("/send-notification", requireSignIn, verifyAdmin, sendNotificationToStaff)

export default staffRouter
