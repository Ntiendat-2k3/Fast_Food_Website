import express from "express"
import {
  addFood,
  listFood,
  removeFood,
  updateFood,
  searchFood,
  getFoodByCategory,
  getFoodById,
  removeMultipleFood,
  getSuggestedDrinks,
  debugSuggestedDrinks,
  getFoodSalesCount,
} from "../controllers/foodController.js"
import multer from "multer"

const foodRouter = express.Router()

// Image Storage Engine
const storage = multer.diskStorage({
  destination: "uploads",
  filename: (req, file, cb) => {
    return cb(null, `${Date.now()}${file.originalname}`)
  },
})

const upload = multer({ storage: storage })

foodRouter.post("/add", upload.single("image"), addFood)
foodRouter.get("/list", listFood)
foodRouter.post("/remove", removeFood)
foodRouter.post("/remove-multiple", removeMultipleFood)
foodRouter.put("/update", upload.single("image"), updateFood)
foodRouter.get("/search", searchFood)
foodRouter.get("/category/:category", getFoodByCategory)
foodRouter.get("/suggested-drinks/:category", getSuggestedDrinks)
foodRouter.get("/debug-suggested-drinks/:category", debugSuggestedDrinks)
foodRouter.get("/sales/:foodId", getFoodSalesCount)
foodRouter.get("/:id", getFoodById)

export default foodRouter
