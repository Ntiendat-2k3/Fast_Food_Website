import express from "express"
import cors from "cors"
import { connectDB } from "./config/db.js"
import foodRouter from "./routes/foodRoute.js"
import userRouter from "./routes/userRoute.js"
import cartRouter from "./routes/cartRoute.js"
import orderRouter from "./routes/orderRoute.js"
import categoryRouter from "./routes/categoryRoute.js"
import commentRouter from "./routes/commentRoute.js"
import notificationRouter from "./routes/notificationRoute.js"
import addressRouter from "./routes/addressRoute.js"
import voucherRouter from "./routes/voucherRoute.js"
import wishlistRouter from "./routes/wishlistRoute.js"
import staffRouter from "./routes/staffRoute.js"
import messageRouter from "./routes/messageRoute.js"
import aiRouter from "./routes/aiRoute.js"
import inventoryRouter from "./routes/inventoryRoute.js"
import "dotenv/config"
import shippingRouter from "./routes/shippingRoute.js"

// app config
const app = express()
const port = process.env.PORT || 4000

// middleware
app.use(express.json())
app.use(cors())

// db connection
connectDB()

// api endpoints
app.use("/api/food", foodRouter)
app.use("/api/user", userRouter)
app.use("/api/cart", cartRouter)
app.use("/api/order", orderRouter)
app.use("/api/category", categoryRouter)
app.use("/api/comment", commentRouter)
app.use("/api/notification", notificationRouter)
app.use("/api/address", addressRouter)
app.use("/api/voucher", voucherRouter)
app.use("/api/wishlist", wishlistRouter)
app.use("/api/staff", staffRouter)
app.use("/api/shipping", shippingRouter)
app.use("/api/message", messageRouter)
app.use("/api/ai", aiRouter)
app.use("/api/inventory", inventoryRouter)
app.use("/images", express.static("uploads"))

app.get("/", (req, res) => {
  res.send("API Working")
})

app.listen(port, () => {
  console.log(`Server Started on http://localhost:${port}`)
})
