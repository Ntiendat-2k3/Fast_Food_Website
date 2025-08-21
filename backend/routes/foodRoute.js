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
  getSuggestedFoods,
  getSuggestedDrinksByProduct, // Import new function
  getSuggestedFoodsByDrink, // Import new function
  debugSuggestedDrinks,
  // debugSuggestedFoods,
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
foodRouter.post("/update", upload.single("image"), updateFood)
foodRouter.get("/search", searchFood)
foodRouter.get("/category/:category", getFoodByCategory)
foodRouter.get("/item/:id", getFoodById)
foodRouter.get("/sales/:foodId", getFoodSalesCount)

// Suggestion routes
foodRouter.get("/suggested-drinks-by-product/:productId", getSuggestedDrinksByProduct) // Add new product-based suggestion routes
foodRouter.get("/suggested-foods-by-drink/:drinkId", getSuggestedFoodsByDrink) // Add new product-based suggestion routes

// Existing suggestion routes (keep for backward compatibility)
foodRouter.get("/suggested-drinks/:category", getSuggestedDrinks)
foodRouter.get("/suggested-foods/:drinkName", getSuggestedFoods)

// Debug routes
foodRouter.get("/debug-drinks/:category", debugSuggestedDrinks)
// foodRouter.get("/debug-foods/:drinkName", debugSuggestedFoods)

export default foodRouter
