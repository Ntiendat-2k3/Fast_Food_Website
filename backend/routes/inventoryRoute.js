import express from "express"
import {
  getInventoryList,
  getInventoryStats,
  initializeInventory,
  updateInventory,
  checkAvailability,
  reduceStock,
} from "../controllers/inventoryController.js"

const inventoryRouter = express.Router()

// Get inventory list with pagination and filters
inventoryRouter.get("/list", getInventoryList)

// Get inventory statistics
inventoryRouter.get("/stats", getInventoryStats)

// Initialize inventory for existing foods
inventoryRouter.post("/initialize", initializeInventory)

// Update inventory item
inventoryRouter.post("/update", updateInventory)

// Check product availability
inventoryRouter.post("/check-availability", checkAvailability)

// Reduce stock when order is placed
inventoryRouter.post("/reduce-stock", reduceStock)

export default inventoryRouter
