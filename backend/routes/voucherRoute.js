import express from "express"
import {
  addVoucher,
  listVouchers,
  updateVoucher,
  deleteVoucher,
  applyVoucher,
} from "../controllers/voucherController.js"

const voucherRouter = express.Router()

voucherRouter.post("/add", addVoucher)
voucherRouter.get("/list", listVouchers)
voucherRouter.post("/update", updateVoucher)
voucherRouter.post("/delete", deleteVoucher)
voucherRouter.post("/apply", applyVoucher)

export default voucherRouter
