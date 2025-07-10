import express from "express"
import cors from "cors"
import { connectDB } from "./config/db.js"
import foodRouter from "./routes/foodRoute.js"
import userRouter from "./routes/userRoute.js"
import cartRouter from "./routes/cartRoute.js"
import orderRouter from "./routes/orderRoute.js"
import messageRouter from "./routes/messageRoute.js"
import commentRouter from "./routes/commentRoute.js"
import feedbackRouter from "./routes/feedbackRoute.js"
import notificationRouter from "./routes/notificationRoute.js"
import voucherRouter from "./routes/voucherRoute.js"
import wishlistRouter from "./routes/wishlistRoute.js"
import addressRouter from "./routes/addressRoute.js"
import purchaseHistoryRouter from "./routes/purchaseHistoryRoute.js"
// import revenueRouter from "./routes/revenueRoute.js"
import shippingRouter from "./routes/shippingRoute.js"
import aiRouter from "./routes/aiRoute.js"
import staffRouter from "./routes/staffRoute.js"
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
const uploadDirs = ["uploads", "uploads/messages", "uploads/foods", "uploads/users"]

uploadDirs.forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
    console.log(`Created directory: ${dir}`)
  }
})

// api endpoints
app.use("/api/food", foodRouter)
app.use("/api/user", userRouter)
app.use("/api/cart", cartRouter)
app.use("/api/order", orderRouter)
app.use("/api/message", messageRouter)
app.use("/api/comment", commentRouter)
app.use("/api/feedback", feedbackRouter)
app.use("/api/notification", notificationRouter)
app.use("/api/voucher", voucherRouter)
app.use("/api/wishlist", wishlistRouter)
app.use("/api/address", addressRouter)
app.use("/api/purchase-history", purchaseHistoryRouter)
// app.use("/api/revenue", revenueRouter)
app.use("/api/shipping", shippingRouter)
app.use("/api/staff", staffRouter)
app.use("/api/ai", aiRouter)

// Serve static files
app.use("/uploads", express.static("uploads"))

app.get("/", (req, res) => {
  res.send("API Working")
})

// Error handling middleware
app.use((error, req, res, next) => {
  console.error("Error:", error)
  res.status(500).json({
    success: false,
    message: error.message || "Internal Server Error",
  })
})

app.listen(port, () => {
  console.log(`Server Started on http://localhost:${port}`)
})
