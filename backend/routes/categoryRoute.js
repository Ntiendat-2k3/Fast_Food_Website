import express from "express"
import {
  addCategory,
  listCategories,
  getActiveCategories,
  getCategoryById,
  updateCategory,
  removeCategory,
  toggleCategoryStatus,
} from "../controllers/categoryController.js"
import { verifyAdmin } from "../middleware/auth.js"

const categoryRouter = express.Router()

// Public routes
categoryRouter.get("/active", getActiveCategories)
categoryRouter.get("/list", listCategories)
categoryRouter.get("/:id", getCategoryById)

// Admin routes
categoryRouter.post("/add", verifyAdmin, addCategory)
categoryRouter.post("/update", verifyAdmin, updateCategory)
categoryRouter.post("/remove", verifyAdmin, removeCategory)
categoryRouter.post("/toggle-status", verifyAdmin, toggleCategoryStatus)

export default categoryRouter
