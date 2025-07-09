import express from "express"
import cors from "cors"
import { connectDB } from "./config/db.js"
import foodRouter from "./routes/foodRoute.js"
import userRouter from "./routes/userRoute.js"
import cartRouter from "./routes/cartRoute.js"
import orderRouter from "./routes/orderRoute.js"
import commentRouter from "./routes/commentRoute.js"
import wishlistRouter from "./routes/wishlistRoute.js"
import voucherRouter from "./routes/voucherRoute.js"
import addressRouter from "./routes/addressRoute.js"
import feedbackRouter from "./routes/feedbackRoute.js"
import purchaseHistoryRouter from "./routes/purchaseHistoryRoute.js"
// import revenueRouter from "./routes/revenueRoute.js"
import notificationRouter from "./routes/notificationRoute.js"
import shippingRouter from "./routes/shippingRoute.js"
import aiRouter from "./routes/aiRoute.js"
import messageRouter from "./routes/messageRoute.js"
import "dotenv/config"
import fs from "fs"

// app config
const app = express()
const port = process.env.PORT || 4000

// middleware
app.use(express.json())
app.use(cors())

// db connection
connectDB()

// Create uploads directories if they don't exist
const uploadsDir = "uploads"
const messagesDir = "uploads/messages"

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

if (!fs.existsSync(messagesDir)) {
  fs.mkdirSync(messagesDir, { recursive: true })
}

// api endpoints
app.use("/api/food", foodRouter)
app.use("/api/user", userRouter)
app.use("/api/cart", cartRouter)
app.use("/api/order", orderRouter)
app.use("/api/comment", commentRouter)
app.use("/api/wishlist", wishlistRouter)
app.use("/api/voucher", voucherRouter)
app.use("/api/address", addressRouter)
app.use("/api/feedback", feedbackRouter)
app.use("/api/purchase-history", purchaseHistoryRouter)
// app.use("/api/revenue", revenueRouter)
app.use("/api/notification", notificationRouter)
app.use("/api/shipping", shippingRouter)
app.use("/api/ai", aiRouter)
app.use("/api/message", messageRouter)

// Serve static files
app.use("/images", express.static("uploads"))
app.use("/uploads", express.static("uploads"))

app.get("/", (req, res) => {
  res.send("API Working")
})

// Error handling middleware
app.use((error, req, res, next) => {
  console.error("Server error:", error)
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: error.message,
  })
})

app.listen(port, () => {
  console.log(`Server Started on http://localhost:${port}`)
})
