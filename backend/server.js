import express from "express"
import cors from "cors"
import { connectDB } from "./config/db.js"
import foodRouter from "./routes/foodRoute.js"
import userRouter from "./routes/userRoute.js"
import cartRouter from "./routes/cartRoute.js"
import orderRouter from "./routes/orderRoute.js"
import categoryRouter from "./routes/categoryRoute.js"
import commentRouter from "./routes/commentRoute.js"
import feedbackRouter from "./routes/feedbackRoute.js"
import voucherRouter from "./routes/voucherRoute.js"
import wishlistRouter from "./routes/wishlistRoute.js"
import addressRouter from "./routes/addressRoute.js"
import shippingRouter from "./routes/shippingRoute.js"
import staffRouter from "./routes/staffRoute.js"
// import revenueRouter from "./routes/revenueRoute.js"
import purchaseHistoryRouter from "./routes/purchaseHistoryRoute.js"
import notificationRouter from "./routes/notificationRoute.js"
import messageRouter from "./routes/messageRoute.js"
import aiRouter from "./routes/aiRoute.js"
import "dotenv/config"
import { createServer } from "http"
import { Server } from "socket.io"
import { autoCompleteOrders } from "./controllers/orderController.js"

// app config
const app = express()
const port = process.env.PORT || 4000

// Create HTTP server and Socket.IO instance
const server = createServer(app)
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:5174"],
    methods: ["GET", "POST"],
    credentials: true,
  },
})

// middleware
app.use(express.json())
app.use(cors())

// Make io available in routes
app.use((req, res, next) => {
  req.io = io
  next()
})

// db connection
connectDB()

// api endpoints
app.use("/api/food", foodRouter)
app.use("/api/user", userRouter)
app.use("/api/cart", cartRouter)
app.use("/api/order", orderRouter)
app.use("/api/category", categoryRouter)
app.use("/api/comment", commentRouter)
app.use("/api/feedback", feedbackRouter)
app.use("/api/voucher", voucherRouter)
app.use("/api/wishlist", wishlistRouter)
app.use("/api/address", addressRouter)
app.use("/api/shipping", shippingRouter)
app.use("/api/staff", staffRouter)
// app.use("/api/revenue", revenueRouter)
app.use("/api/purchase-history", purchaseHistoryRouter)
app.use("/api/notification", notificationRouter)
app.use("/api/message", messageRouter)
app.use("/api/ai", aiRouter)
app.use("/images", express.static("uploads"))

app.get("/", (req, res) => {
  res.send("API Working")
})

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("User connected:", socket.id)

  socket.on("join", (userId) => {
    socket.join(userId)
    console.log(`User ${userId} joined room`)
  })

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id)
  })
})

// Chạy auto-complete orders mỗi giờ
setInterval(
  async () => {
    console.log("Running auto-complete orders job...")
    const completedCount = await autoCompleteOrders()
    if (completedCount > 0) {
      console.log(`Auto-completed ${completedCount} orders`)
    }
  },
  60 * 60 * 1000,
) // Chạy mỗi giờ

// Chạy auto-complete ngay khi server khởi động
setTimeout(async () => {
  console.log("Running initial auto-complete orders job...")
  const completedCount = await autoCompleteOrders()
  if (completedCount > 0) {
    console.log(`Auto-completed ${completedCount} orders on startup`)
  }
}, 5000) // Chạy sau 5 giây khi server khởi động

server.listen(port, () => {
  console.log(`Server Started on http://localhost:${port}`)
})
