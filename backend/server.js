import express from "express"
import cors from "cors"
import { createServer } from "http"
import { Server } from "socket.io"
import { connectDB } from "./config/db.js"
import aiRouter from "./routes/aiRoute.js"
import foodRouter from "./routes/foodRoute.js"
import userRouter from "./routes/userRoute.js"
import cartRouter from "./routes/cartRoute.js"
import orderRouter from "./routes/orderRoute.js"
import commentRouter from "./routes/commentRoute.js"
import feedbackRouter from "./routes/feedbackRoute.js"
import messageRouter from "./routes/messageRoute.js"
import notificationRouter from "./routes/notificationRoute.js"
import voucherRouter from "./routes/voucherRoute.js"
import wishlistRouter from "./routes/wishlistRoute.js"
import addressRouter from "./routes/addressRoute.js"
import purchaseHistoryRouter from "./routes/purchaseHistoryRoute.js"
import shippingRouter from "./routes/shippingRoute.js"
import "dotenv/config"

// app config
const app = express()
const server = createServer(app)
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:3000"],
    methods: ["GET", "POST"],
  },
})

const port = process.env.PORT || 4000

// middleware
app.use(express.json())
app.use(cors())

// Socket.io middleware để truyền io instance vào req
app.use((req, res, next) => {
  req.io = io
  next()
})

// db connection
connectDB()

// Socket.io connection handling
io.on("connection", (socket) => {
  console.log("Admin connected:", socket.id)

  socket.on("joinAdmin", () => {
    socket.join("admin")
    console.log("Admin joined admin room")
  })

  socket.on("disconnect", () => {
    console.log("Admin disconnected:", socket.id)
  })
})

// api endpoints
app.use("/api/food", foodRouter)
app.use("/api/user", userRouter)
app.use("/api/cart", cartRouter)
app.use("/api/order", orderRouter)
app.use("/api/comment", commentRouter)
app.use("/api/feedback", feedbackRouter)
app.use("/api/message", messageRouter)
app.use("/api/notification", notificationRouter)
app.use("/api/voucher", voucherRouter)
app.use("/api/wishlist", wishlistRouter)
app.use("/api/address", addressRouter)
app.use("/api/purchase-history", purchaseHistoryRouter)
app.use("/api/shipping", shippingRouter)
app.use("/api/ai", aiRouter)
app.use("/images", express.static("uploads"))

app.get("/", (req, res) => {
  res.send("API Working")
})

server.listen(port, () => {
  console.log(`Server Started on http://localhost:${port}`)
})
