import express from "express"
import {
  addStaff,
  listStaff,
  updateStaff,
  deleteStaff,
  getStaffById,
  updateStaffStatus,
} from "../controllers/staffController.js"
import requireSignIn, { verifyAdmin } from "../middleware/auth.js"

const staffRouter = express.Router()

// All staff management routes require admin access
staffRouter.post("/add", requireSignIn, verifyAdmin, addStaff)
staffRouter.get("/list", requireSignIn, verifyAdmin, listStaff)
staffRouter.get("/:id", requireSignIn, verifyAdmin, getStaffById)
staffRouter.put("/update/:id", requireSignIn, verifyAdmin, updateStaff)
staffRouter.post("/delete", requireSignIn, verifyAdmin, deleteStaff)
staffRouter.post("/update-status", requireSignIn, verifyAdmin, updateStaffStatus)

export default staffRouter
