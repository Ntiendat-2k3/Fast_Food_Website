import express from "express"
import {
  getUserAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from "../controllers/addressController.js"
import auth from "../middleware/auth.js"

const router = express.Router()

// All routes require authentication
router.get("/list", auth, getUserAddresses)
router.post("/add", auth, addAddress)
router.put("/update", auth, updateAddress)
router.delete("/delete", auth, deleteAddress)
router.put("/set-default", auth, setDefaultAddress)

export default router
