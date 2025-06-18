import express from "express"
import { calculateDistance, getAddressSuggestions, getPlaceDetails } from "../controllers/shippingController.js"

const shippingRouter = express.Router()

// Tính khoảng cách và phí ship
shippingRouter.post("/calculate-distance", calculateDistance)

// Lấy gợi ý địa chỉ
shippingRouter.get("/address-suggestions", getAddressSuggestions)

// Lấy chi tiết địa chỉ
shippingRouter.get("/place-details/:placeId", getPlaceDetails)

export default shippingRouter
