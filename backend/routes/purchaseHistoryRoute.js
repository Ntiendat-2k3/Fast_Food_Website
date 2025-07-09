import express from "express"
import {
  getUserPurchaseHistory,
  addToPurchaseHistory,
  deletePurchaseHistory,
  getPurchaseHistoryDetail,
} from "../controllers/purchaseHistoryController.js"
import requireSignIn, { verifyAdmin } from "../middleware/auth.js"

const router = express.Router()

// Lấy lịch sử mua hàng của người dùng
router.post("/user", requireSignIn, getUserPurchaseHistory)

// Thêm vào lịch sử mua hàng (thường được gọi tự động khi đơn hàng hoàn thành)
router.post("/add", requireSignIn, addToPurchaseHistory)

// Xóa lịch sử mua hàng (chỉ admin)
router.delete("/:id", verifyAdmin, deletePurchaseHistory)

// Lấy chi tiết một bản ghi lịch sử mua hàng
router.get("/:id", requireSignIn, getPurchaseHistoryDetail)

export default router
