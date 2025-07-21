import express from "express"
import cors from "cors"
import { connectDB } from "./config/db.js"
import foodRouter from "./routes/foodRoute.js"
import userRouter from "./routes/userRoute.js"
import cartRouter from "./routes/cartRoute.js"
import orderRouter from "./routes/orderRoute.js"
import addressRouter from "./routes/addressRoute.js"
import wishlistRouter from "./routes/wishlistRoute.js"
import commentRouter from "./routes/commentRoute.js"
import feedbackRouter from "./routes/feedbackRoute.js"
import purchaseHistoryRouter from "./routes/purchaseHistoryRoute.js"
import voucherRouter from "./routes/voucherRoute.js"
// import revenueRouter from "./routes/revenueRoute.js"
import staffRouter from "./routes/staffRoute.js"
import notificationRouter from "./routes/notificationRoute.js"
import messageRouter from "./routes/messageRoute.js"
import aiRouter from "./routes/aiRoute.js"
import shippingRouter from "./routes/shippingRoute.js"
import categoryRouter from "./routes/categoryRoute.js"
import path from "path"
import { fileURLToPath } from "url"
import "dotenv/config"

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// app config
const app = express()
const port = process.env.PORT || 4000

// middleware
app.use(express.json())
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:5173", "http://localhost:5174"],
    credentials: true,
  }),
)

// db connection
connectDB()

// Static files - serve images
app.use("/images", express.static(path.join(__dirname, "uploads")))

// api endpoints
app.use("/api/food", foodRouter)
app.use("/api/user", userRouter)
app.use("/api/cart", cartRouter)
app.use("/api/order", orderRouter)
app.use("/api/address", addressRouter)
app.use("/api/wishlist", wishlistRouter)
app.use("/api/comment", commentRouter)
app.use("/api/feedback", feedbackRouter)
app.use("/api/purchase-history", purchaseHistoryRouter)
app.use("/api/voucher", voucherRouter)
// app.use("/api/revenue", revenueRouter)
app.use("/api/staff", staffRouter)
app.use("/api/notification", notificationRouter)
app.use("/api/message", messageRouter)
app.use("/api/ai", aiRouter)
app.use("/api/shipping", shippingRouter)
app.use("/api/category", categoryRouter)

app.get("/", (req, res) => {
  res.send("API Working")
})


app.listen(port, () => {
  console.log(`Server Started on http://localhost:${port}`)
  console.log(`Images served at http://localhost:${port}/images/`)
})
