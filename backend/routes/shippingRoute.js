import express from "express"
import { getAddressSuggestions, calculateDistance } from "../controllers/shippingController.js"

const shippingRouter = express.Router()

// Route for address suggestions/autocomplete
shippingRouter.get("/suggestions", getAddressSuggestions)

// Route for calculating shipping distance and fee
shippingRouter.post("/calculate", calculateDistance)

export default shippingRouter
