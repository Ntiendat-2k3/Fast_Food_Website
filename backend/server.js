import express from "express"
import cors from "cors"
import { connectDB } from "./config/db.js"
import aiRouter from "./routes/aiRoute.js"
import foodRouter from "./routes/foodRoute.js"
import userRouter from "./routes/userRoute.js"
import cartRouter from "./routes/cartRoute.js"
import orderRouter from "./routes/orderRoute.js"
// import revenueRouter from "./routes/revenueRoute.js"
import commentRouter from "./routes/commentRoute.js"
import feedbackRouter from "./routes/feedbackRoute.js"
import messageRouter from "./routes/messageRoute.js"
import notificationRouter from "./routes/notificationRoute.js"
import voucherRouter from "./routes/voucherRoute.js"
import wishlistRouter from "./routes/wishlistRoute.js"
import addressRoute from "./routes/addressRoute.js"
import "dotenv/config"

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
// app.use("/api/revenue", revenueRouter)
app.use("/api/comment", commentRouter)
app.use("/api/feedback", feedbackRouter)
app.use("/api/message", messageRouter)
app.use("/api/notification", notificationRouter)
app.use("/api/voucher", voucherRouter)
app.use("/api/wishlist", wishlistRouter)
app.use("/api/address", addressRoute)
app.use("/api/ai", aiRouter)
app.use("/images", express.static("uploads"))

app.get("/", (req, res) => {
  res.send("API Working")
})

app.listen(port, () => {
  console.log(`Server Started on http://localhost:${port}`)
})
