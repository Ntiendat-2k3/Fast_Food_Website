import express from "express"
import {
  addFood,
  listFood,
  removeFood,
  updateFood,
  getFoodByCategory,
  getFoodById,
} from "../controllers/foodController.js"
import multer from "multer"
import { verifyAdmin } from "../middleware/auth.js"

const foodRouter = express.Router()

// Image Storage Engine
const storage = multer.diskStorage({
  destination: "uploads",
  filename: (req, file, cb) => {
    return cb(null, `${Date.now()}${file.originalname}`)
  },
})

const upload = multer({ storage: storage })

// Routes
foodRouter.post("/add", verifyAdmin, upload.single("image"), addFood)
foodRouter.get("/list", listFood)
foodRouter.post("/remove", verifyAdmin, removeFood)
foodRouter.post("/update", verifyAdmin, upload.single("image"), updateFood)
foodRouter.get("/category/:category", getFoodByCategory)
foodRouter.get("/:id", getFoodById)

export default foodRouter
