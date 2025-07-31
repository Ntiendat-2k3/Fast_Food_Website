import express from "express"
import {
  getInventoryList,
  getInventoryByFoodId,
  getInventoryStats,
  initializeInventory,
  updateInventory,
  checkAvailability,
  reduceStock,
} from "../controllers/inventoryController.js"
import { verifyStaffOrAdmin } from "../middleware/auth.js"

const inventoryRouter = express.Router()

inventoryRouter.get("/list", verifyStaffOrAdmin, getInventoryList)
inventoryRouter.post("/update", verifyStaffOrAdmin, updateInventory)
inventoryRouter.get("/stats", verifyStaffOrAdmin, getInventoryStats)
inventoryRouter.post("/initialize", verifyStaffOrAdmin, initializeInventory)
inventoryRouter.post("/check-availability", verifyStaffOrAdmin, checkAvailability)
inventoryRouter.post("/reduce-stock", verifyStaffOrAdmin, reduceStock)


// public route
inventoryRouter.get("/product/:foodId", getInventoryByFoodId)

export default inventoryRouter
