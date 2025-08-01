import { openai } from "@ai-sdk/openai"
import { generateText } from "ai"
import foodModel from "../models/foodModel.js"
import voucherModel from "../models/voucherModel.js"
import orderModel from "../models/orderModel.js"
import userModel from "../models/userModel.js"
import categoryModel from "../models/categoryModel.js"
import { OPENAI_API_KEY } from "../config/openai.js"

// Hàm xử lý chat với OpenAI GPT - Được cải thiện với context phong phú
const chatWithAI = async (req, res) => {
  try {
    const { message, userContext, history, userId } = req.body

    console.log("AI Chat Request:", { message, userContext, userId })

    // Kiểm tra xem có API key không
    if (!OPENAI_API_KEY) {
      const fallbackReply = await getFallbackReply(message, userId)
      return res.json({
        success: true,
        reply: fallbackReply + "\n\n(Lưu ý: Đang sử dụng chế độ hỗ trợ cơ bản do chưa cấu hình OpenAI API)",
      })
    }

    // Lấy thông tin context chi tiết từ database
    const contextData = await getEnhancedContextData(userId)

    // Tạo system prompt với thông tin chi tiết về GreenEats
    const systemPrompt = await createEnhancedSystemPrompt(contextData, userContext, userId)

    // Tạo conversation history cho OpenAI
    const messages = [
      { role: "system", content: systemPrompt },
      ...formatChatHistory(history),
      { role: "user", content: message },
    ]

    console.log("Sending request to OpenAI API...")

    // Gọi OpenAI API
    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      messages: messages,
      temperature: 0.7,
      maxTokens: 800,
      apiKey: OPENAI_API_KEY,
    })

    console.log("OpenAI API response received successfully")

    // Trả về phản hồi
    res.json({ success: true, reply: text })
  } catch (error) {
    console.error("Error in OpenAI chat:", error)

    // Fallback về chatbot cũ nếu OpenAI lỗi
    const fallbackReply = await getFallbackReply(req.body.message, req.body.userId)
    res.json({
      success: true,
      reply: fallbackReply + "\n\n(Lưu ý: Đang sử dụng chế độ hỗ trợ cơ bản do sự cố kỹ thuật với OpenAI API)",
    })
  }
}

// Tạo system prompt nâng cao với thông tin chi tiết
const createEnhancedSystemPrompt = async (contextData, userContext, userId) => {
  let userSpecificInfo = ""

  if (userId) {
    try {
      const user = await userModel.findById(userId)
      const userOrders = await orderModel.find({ userId }).sort({ date: -1 }).limit(5)

      if (user) {
        userSpecificInfo = `
🧑‍💼 **THÔNG TIN KHÁCH HÀNG:**
- Tên: ${user.name}
- Email: ${user.email}
- Ngày tham gia: ${new Date(user.createdAt).toLocaleDateString("vi-VN")}
- Tổng số đơn hàng: ${userOrders.length}
${userOrders.length > 0 ? `- Đơn hàng gần nhất: ${userOrders[0].status} (${new Date(userOrders[0].date).toLocaleDateString("vi-VN")})` : ""}
${
  userOrders.length > 0
    ? `- Món ăn yêu thích: ${userOrders
        .flatMap((o) => o.items.map((i) => i.name))
        .slice(0, 3)
        .join(", ")}`
    : ""
}
`
      }
    } catch (error) {
      console.error("Error getting user info:", error)
    }
  }

  return `Bạn là GreenEats AI Assistant - trợ lý ảo thông minh và chuyên nghiệp của ứng dụng đặt đồ ăn nhanh GreenEats tại Việt Nam.

🏪 **THÔNG TIN DOANH NGHIỆP GREENEATS:**
- Tên thương hiệu: GreenEats
- Slogan: "Đồ ăn nhanh, tươi ngon, giao tận nơi"
- Dịch vụ chính: Đặt đồ ăn nhanh online với giao hàng tận nơi
- Giờ hoạt động: 6:00 - 23:00 hàng ngày (bao gồm cuối tuần và lễ tết)
- Hotline hỗ trợ: 1900-1234 (24/7)
- Email hỗ trợ: support@greeneats.com
- Website: greeneats.com
- Địa chỉ trụ sở: 123 Đường Nguyễn Văn Linh, Quận 7, TP.HCM

📦 **CHÍNH SÁCH GIAO HÀNG & THANH TOÁN:**
- Thời gian giao hàng: 25-50 phút (tùy khoảng cách)
- Phí giao hàng: 15.000đ (MIỄN PHÍ cho đơn từ 200.000đ)
- Đơn hàng tối thiểu: 50.000đ
- Khu vực giao hàng: Toàn TP.HCM và các quận lân cận
- Đóng gói: Hộp giấy thân thiện môi trường, giữ nhiệt tốt

💳 **PHƯƠNG THỨC THANH TOÁN:**
1. **Thanh toán khi nhận hàng (COD)** - Phổ biến nhất
2. **VNPay** - Thẻ ATM/Internet Banking/QR Code
3. **Ví MoMo** - Quét QR hoặc liên kết số điện thoại
4. **Chuyển khoản ngân hàng** - Cho đơn hàng lớn

${contextData.menuInfo}

${contextData.voucherInfo}

${contextData.categoriesInfo}

${contextData.popularItemsInfo}

${contextData.recentOrdersInfo}

${userSpecificInfo}

🌐 **HƯỚNG DẪN SỬ DỤNG WEBSITE CHI TIẾT:**

📱 **CÁCH ĐẶT HÀNG (7 BƯỚC):**
1. **Duyệt thực đơn:** Vào mục "Thực đơn" hoặc chọn danh mục (Burger, Chicken, Pasta...)
2. **Chọn món:** Click vào món ăn để xem chi tiết, đánh giá, thành phần
3. **Thêm vào giỏ:** Chọn số lượng và click "Thêm vào giỏ hàng"
4. **Xem giỏ hàng:** Click biểu tượng giỏ hàng ở góc trên phải
5. **Kiểm tra đơn:** Xem lại món đã chọn, điều chỉnh số lượng nếu cần
6. **Nhập thông tin:** Địa chỉ giao hàng, số điện thoại, ghi chú đặc biệt
7. **Thanh toán:** Chọn phương thức và xác nhận đặt hàng

💬 **CÁCH LIÊN HỆ VỚI ADMIN/HỖ TRỢ:**
- **Chat trực tiếp:** Vào trang "Liên Hệ" → Đăng nhập tài khoản → Sử dụng khung chat
- **Gửi tin nhắn:** Có thể gửi văn bản và hình ảnh
- **Thời gian phản hồi:** Admin thường trả lời trong 2-5 phút (giờ hành chính)
- **Hỗ trợ ngoài giờ:** Sử dụng chatbot AI hoặc gọi hotline

🔐 **QUẢN LÝ TÀI KHOẢN:**
- **Đăng ký:** Click "Đăng ký" ở góc trên phải → Nhập thông tin → Xác thực email
- **Đăng nhập:** Email + mật khẩu hoặc đăng nhập bằng Google/Facebook
- **Quên mật khẩu:** Click "Quên mật khẩu" → Nhập email → Làm theo hướng dẫn
- **Cập nhật thông tin:** Vào "Tài khoản của tôi" để chỉnh sửa

📋 **CÁC TÍNH NĂNG NÂNG CAO:**
- **Tìm kiếm thông minh:** Gõ tên món, thành phần, hoặc mô tả
- **Lọc theo giá:** Sắp xếp từ thấp đến cao hoặc ngược lại
- **Đánh giá & bình luận:** Xem review từ khách hàng khác
- **Danh sách yêu thích:** Lưu món ăn để đặt lại dễ dàng
- **Lịch sử đơn hàng:** Xem và đặt lại đơn hàng cũ
- **Theo dõi đơn hàng:** Real-time tracking từ lúc đặt đến giao

🎯 **TRẠNG THÁI ĐƠN HÀNG CHI TIẾT:**
- **"Chờ xác nhận"** - Đơn mới, chờ nhà hàng xác nhận (2-5 phút)
- **"Đang chuẩn bị"** - Nhà hàng đang nấu món (15-25 phút)
- **"Đang giao"** - Shipper đã nhận và đang giao (10-20 phút)
- **"Đã giao"** - Hoàn thành thành công
- **"Đã hủy"** - Đơn bị hủy (có thể do hết món, địa chỉ xa...)

🎁 **CHƯƠNG TRÌNH KHUYẾN MÃI:**
- **Khách hàng mới:** Giảm 20% đơn đầu tiên
- **Đặt hàng thường xuyên:** Tích điểm đổi quà
- **Giờ vàng:** Giảm giá 15% từ 14:00-16:00 hàng ngày
- **Cuối tuần:** Combo đặc biệt giá ưu đãi

👤 **THÔNG TIN NGƯỜI DÙNG HIỆN TẠI:** ${userContext || "Khách chưa đăng nhập"}

📋 **NGUYÊN TẮC TRẢ LỜI QUAN TRỌNG:**
1. **LUÔN sử dụng thông tin CHÍNH XÁC** từ database thực tế
2. **ƯU TIÊN câu trả lời CỤ THỂ, CHI TIẾT** thay vì chung chung
3. **HƯỚNG DẪN TỪNG BƯỚC** cho các thao tác phức tạp
4. **GỢI Ý THÊM** các món ăn, combo, hoặc dịch vụ phù hợp
5. **SỬ DỤNG EMOJI** phù hợp để tạo cảm giác thân thiện
6. **KẾT THÚC bằng câu hỏi** để tiếp tục hỗ trợ
7. **NHẮC NHỞ** về các chương trình khuyến mãi khi phù hợp
8. **XỬ LÝ KHIẾU NẠI** một cách chuyên nghiệp và đề xuất giải pháp

🎯 **NHIỆM VỤ CHÍNH:**
- Tư vấn món ăn dựa trên sở thích và ngân sách
- Hướng dẫn sử dụng website/app chi tiết
- Giải đáp thắc mắc về đơn hàng, thanh toán, giao hàng
- Hỗ trợ xử lý vấn đề và khiếu nại
- Giới thiệu chương trình khuyến mãi phù hợp
- Tạo trải nghiệm khách hàng tích cực

**LƯU Ý ĐẶC BIỆT:** Nếu khách hàng hỏi về vấn đề kỹ thuật phức tạp hoặc khiếu nại nghiêm trọng, hãy hướng dẫn họ liên hệ trực tiếp với admin qua chat hoặc hotline để được hỗ trợ tốt nhất.`
}

// Lấy dữ liệu context nâng cao từ database
const getEnhancedContextData = async (userId) => {
  try {
    // Lấy tất cả categories
    const categories = await categoryModel.find({})

    // Lấy món ăn theo từng category với thông tin chi tiết
    let menuInfo = "🍽️ **THỰC ĐƠN GREENEATS (CẬP NHẬT MỚI NHẤT):**\n\n"

    for (const category of categories) {
      const categoryFoods = await foodModel.find({ category: category.name }).limit(8)

      if (categoryFoods.length > 0) {
        menuInfo += `**${category.name.toUpperCase()}** (${categoryFoods.length} món):\n`
        categoryFoods.forEach((food, index) => {
          const rating = food.averageRating ? `⭐ ${food.averageRating.toFixed(1)}` : "⭐ Chưa có đánh giá"
          menuInfo += `${index + 1}. **${food.name}** - ${food.price.toLocaleString("vi-VN")}đ ${rating}\n`
          menuInfo += `   📝 ${food.description.substring(0, 100)}...\n`
          if (food.ingredients && food.ingredients.length > 0) {
            menuInfo += `   🥘 Thành phần: ${food.ingredients.slice(0, 3).join(", ")}\n`
          }
        })
        menuInfo += "\n"
      }
    }

    // Nếu không có categories, lấy tất cả món
    if (categories.length === 0) {
      const allFoods = await foodModel.find({}).limit(20)
      menuInfo = "🍽️ **THỰC ĐƠN HIỆN CÓ:**\n"
      allFoods.forEach((food, index) => {
        const rating = food.averageRating ? `⭐ ${food.averageRating.toFixed(1)}` : "⭐ Chưa có đánh giá"
        menuInfo += `${index + 1}. **${food.name}** - ${food.price.toLocaleString("vi-VN")}đ ${rating}\n`
        menuInfo += `   📝 ${food.description.substring(0, 80)}...\n`
      })
    }

    // Lấy voucher đang hoạt động với thông tin chi tiết
    const activeVouchers = await voucherModel
      .find({
        isActive: true,
        endDate: { $gte: new Date() },
        startDate: { $lte: new Date() },
      })
      .limit(10)

    let voucherInfo = ""
    if (activeVouchers.length > 0) {
      voucherInfo = "🎫 **MÃ GIẢM GIÁ ĐANG HOẠT ĐỘNG:**\n\n"
      activeVouchers.forEach((voucher, index) => {
        const discount =
          voucher.discountType === "percentage"
            ? `${voucher.discountValue}%`
            : `${voucher.discountValue.toLocaleString("vi-VN")}đ`

        const minOrder = voucher.minOrderValue ? ` (đơn từ ${voucher.minOrderValue.toLocaleString("vi-VN")}đ)` : ""

        const maxDiscount = voucher.maxDiscountAmount
          ? ` (tối đa ${voucher.maxDiscountAmount.toLocaleString("vi-VN")}đ)`
          : ""

        const endDate = new Date(voucher.endDate).toLocaleDateString("vi-VN")
        const usageLimit = voucher.usageLimit ? ` - Còn lại: ${voucher.usageLimit - (voucher.usedCount || 0)} lượt` : ""

        voucherInfo += `${index + 1}. **Mã "${voucher.code}"**: Giảm ${discount}${minOrder}${maxDiscount}\n`
        voucherInfo += `   📅 HSD: ${endDate}${usageLimit}\n`
        if (voucher.description) {
          voucherInfo += `   📝 ${voucher.description}\n`
        }
        voucherInfo += "\n"
      })
    } else {
      voucherInfo =
        "🎫 **MÃ GIẢM GIÁ:** Hiện tại không có mã giảm giá nào đang hoạt động. Vui lòng theo dõi website để cập nhật khuyến mãi mới nhất!\n\n"
    }

    // Thông tin categories
    let categoriesInfo = "📂 **DANH MỤC SẢN PHẨM:**\n"
    if (categories.length > 0) {
      categories.forEach((cat, index) => {
        categoriesInfo += `${index + 1}. **${cat.name}** - ${cat.description || "Đa dạng món ăn ngon"}\n`
      })
    } else {
      categoriesInfo += "Burger, Chicken, Pasta, Salad, Sandwich, Hotdog, Burito, Tart\n"
    }
    categoriesInfo += "\n"

    // Món ăn phổ biến (dựa trên số lượng đặt hàng)
    const popularItems = await orderModel.aggregate([
      { $unwind: "$items" },
      { $group: { _id: "$items.name", count: { $sum: "$items.quantity" }, price: { $first: "$items.price" } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ])

    let popularItemsInfo = "🔥 **MÓN ĂN PHỔ BIẾN NHẤT:**\n"
    if (popularItems.length > 0) {
      popularItems.forEach((item, index) => {
        popularItemsInfo += `${index + 1}. **${item._id}** - ${item.price.toLocaleString("vi-VN")}đ (Đã bán ${item.count} phần)\n`
      })
    } else {
      popularItemsInfo += "Dữ liệu đang được cập nhật...\n"
    }
    popularItemsInfo += "\n"

    // Thống kê đơn hàng gần đây
    const recentOrdersCount = await orderModel.countDocuments({
      date: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    })

    const totalOrders = await orderModel.countDocuments({})

    let recentOrdersInfo = `📊 **THỐNG KÊ HOẠT ĐỘNG:**\n`
    recentOrdersInfo += `- Đơn hàng hôm nay: ${recentOrdersCount} đơn\n`
    recentOrdersInfo += `- Tổng đơn hàng: ${totalOrders} đơn\n`
    recentOrdersInfo += `- Trạng thái hệ thống: 🟢 Hoạt động bình thường\n\n`

    return {
      menuInfo,
      voucherInfo,
      categoriesInfo,
      popularItemsInfo,
      recentOrdersInfo,
    }
  } catch (error) {
    console.error("Error getting enhanced context data:", error)
    return {
      menuInfo: "🍽️ Vui lòng truy cập website để xem thực đơn đầy đủ\n\n",
      voucherInfo: "🎫 Vui lòng liên hệ hotline để biết thông tin khuyến mãi\n\n",
      categoriesInfo: "📂 Các danh mục: Burger, Chicken, Pasta, Salad, Sandwich, Hotdog, Burito, Tart\n\n",
      popularItemsInfo: "🔥 Dữ liệu món ăn phổ biến đang được cập nhật\n\n",
      recentOrdersInfo: "📊 Hệ thống hoạt động bình thường\n\n",
    }
  }
}

// Format chat history cho OpenAI với context tốt hơn
const formatChatHistory = (history) => {
  if (!history || history.length === 0) return []

  return history.slice(-8).map((msg) => ({
    role: msg.role === "assistant" ? "assistant" : "user",
    content: msg.content,
  }))
}

// Fallback reply nâng cao khi OpenAI lỗi
const getFallbackReply = async (message, userId) => {
  const intent = await analyzeIntentAdvanced(message.toLowerCase(), userId)

  switch (intent.type) {
    case "greeting":
      return await generateGreetingReply(intent.context, userId)

    case "contact_inquiry":
      return await generateContactReply(intent.context)

    case "order_guide":
      return await generateOrderGuideReply(intent.context)

    case "payment_inquiry":
      return await generatePaymentReply(intent.context)

    case "menu_inquiry":
      return await generateMenuReply(intent.context, message)

    case "voucher_inquiry":
      return await generateVoucherReply(intent.context)

    case "order_status":
      return await generateOrderStatusReply(intent.context, userId)

    case "complaint":
      return await generateComplaintReply(intent.context)

    case "recommendation":
      return await generateRecommendationReply(intent.context, userId)

    default:
      return await generateDefaultReply(intent.context, message)
  }
}

// Phân tích intent nâng cao
const analyzeIntentAdvanced = async (message, userId) => {
  const lowerMessage = message.toLowerCase()

  // Greeting patterns
  if (/(xin chào|chào|hello|hi|hey)/i.test(lowerMessage)) {
    return { type: "greeting", context: { timeOfDay: getTimeOfDay() } }
  }

  // Contact inquiry patterns
  if (/(liên hệ|nhắn tin|chat|admin|chủ cửa hàng|hỗ trợ|support)/i.test(lowerMessage)) {
    return { type: "contact_inquiry", context: { urgency: /khẩn cấp|gấp|nhanh/.test(lowerMessage) } }
  }

  // Order guide patterns
  if (/(đặt hàng|order|mua|cách đặt|làm sao để)/i.test(lowerMessage)) {
    return { type: "order_guide", context: { isFirstTime: /lần đầu|mới/.test(lowerMessage) } }
  }

  // Payment inquiry patterns
  if (/(thanh toán|payment|trả tiền|phương thức|vnpay|momo|cod)/i.test(lowerMessage)) {
    return { type: "payment_inquiry", context: { method: extractPaymentMethod(lowerMessage) } }
  }

  // Menu inquiry patterns
  if (/(món|thực đơn|đồ ăn|menu|burger|chicken|pasta|salad|sandwich|hotdog|burito|tart)/i.test(lowerMessage)) {
    return {
      type: "menu_inquiry",
      context: { category: extractCategory(lowerMessage), priceRange: extractPriceRange(lowerMessage) },
    }
  }

  // Voucher inquiry patterns
  if (/(mã giảm giá|voucher|khuyến mãi|giảm giá|coupon)/i.test(lowerMessage)) {
    return { type: "voucher_inquiry", context: {} }
  }

  // Order status patterns
  if (/(đơn hàng|kiểm tra|trạng thái|order status)/i.test(lowerMessage)) {
    return { type: "order_status", context: { hasUserId: !!userId } }
  }

  // Complaint patterns
  if (/(khiếu nại|phản ánh|không hài lòng|tệ|chậm|lỗi|sai)/i.test(lowerMessage)) {
    return { type: "complaint", context: { severity: /rất|quá|cực kỳ/.test(lowerMessage) ? "high" : "medium" } }
  }

  // Recommendation patterns
  if (/(gợi ý|recommend|tư vấn|nên ăn|món nào|ngon)/i.test(lowerMessage)) {
    return { type: "recommendation", context: { budget: extractBudget(lowerMessage) } }
  }

  return { type: "unknown", context: {} }
}

// Helper functions
const getTimeOfDay = () => {
  const hour = new Date().getHours()
  if (hour < 12) return "morning"
  if (hour < 18) return "afternoon"
  return "evening"
}

const extractPaymentMethod = (message) => {
  if (/vnpay/i.test(message)) return "vnpay"
  if (/momo/i.test(message)) return "momo"
  if (/cod|tiền mặt/i.test(message)) return "cod"
  if (/chuyển khoản/i.test(message)) return "bank"
  return null
}

const extractCategory = (message) => {
  if (/burger/i.test(message)) return "Burger"
  if (/chicken|gà/i.test(message)) return "Chicken"
  if (/pasta|mì/i.test(message)) return "Pasta"
  if (/salad/i.test(message)) return "Salad"
  if (/sandwich|bánh mì/i.test(message)) return "Sandwich"
  if (/hotdog/i.test(message)) return "Hotdog"
  if (/burito/i.test(message)) return "Burito"
  if (/tart|bánh/i.test(message)) return "Tart"
  return null
}

const extractPriceRange = (message) => {
  if (/rẻ|giá rẻ|tiết kiệm/i.test(message)) return "low"
  if (/cao cấp|đắt|premium/i.test(message)) return "high"
  return "medium"
}

const extractBudget = (message) => {
  const numbers = message.match(/\d+/g)
  if (numbers) {
    const budget = Number.parseInt(numbers[0])
    if (budget < 100000) return "low"
    if (budget > 200000) return "high"
    return "medium"
  }
  return null
}

// Generate reply functions
const generateGreetingReply = async (context, userId) => {
  const timeGreeting =
    context.timeOfDay === "morning"
      ? "Chào buổi sáng"
      : context.timeOfDay === "afternoon"
        ? "Chào buổi chiều"
        : "Chào buổi tối"

  let userInfo = ""
  if (userId) {
    try {
      const user = await userModel.findById(userId)
      if (user) {
        userInfo = ` ${user.name}`
      }
    } catch (error) {
      console.error("Error getting user info:", error)
    }
  }

  return `${timeGreeting}${userInfo}! 👋 Chào mừng bạn đến với GreenEats!

🍽️ **Tôi có thể hỗ trợ bạn:**
• Tư vấn món ăn ngon theo sở thích
• Hướng dẫn đặt hàng chi tiết từng bước
• Kiểm tra mã giảm giá và khuyến mãi
• Theo dõi trạng thái đơn hàng
• Giải đáp mọi thắc mắc về dịch vụ

🎯 **Gợi ý nhanh:**
- "Tôi muốn xem thực đơn" 
- "Có mã giảm giá nào không?"
- "Hướng dẫn đặt hàng"
- "Thời gian giao hàng bao lâu?"

Bạn cần hỗ trợ gì hôm nay? 😊`
}

const generateContactReply = async (context) => {
  const urgencyNote = context.urgency
    ? "\n🚨 **VẤN ĐỀ KHẨN CẤP:** Vui lòng gọi hotline 1900-1234 để được hỗ trợ ngay lập tức!"
    : ""

  return `💬 **CÁCH LIÊN HỆ VỚI ADMIN/HỖ TRỢ KHÁCH HÀNG:**

🔥 **CHAT TRỰC TIẾP (KHUYẾN NGHỊ):**
1. Vào trang **"Liên Hệ"** trên website
2. **Đăng nhập** tài khoản (bắt buộc để bảo mật)
3. Sử dụng **khung chat** ở bên phải màn hình
4. Gửi tin nhắn **văn bản hoặc hình ảnh**
5. Admin sẽ phản hồi trong **2-5 phút** (giờ hành chính)

📞 **CÁC CÁCH KHÁC:**
• **Hotline:** 1900-1234 (24/7) - Miễn phí
• **Email:** support@greeneats.com
• **Địa chỉ:** 123 Đường Nguyễn Văn Linh, Q7, TP.HCM
• **Facebook:** GreenEats Official
• **Zalo:** 0901-234-567

⏰ **THỜI GIAN HỖ TRỢ:**
- Chat trực tiếp: 6:00 - 23:00
- Hotline: 24/7
- Email: Phản hồi trong 2-4 giờ${urgencyNote}

Bạn có cần hướng dẫn thêm về cách sử dụng chat không? 🤔`
}

const generateOrderGuideReply = async (context) => {
  const firstTimeNote = context.isFirstTime
    ? "\n🎉 **KHÁCH HÀNG MỚI:** Bạn sẽ được giảm 20% cho đơn hàng đầu tiên!"
    : ""

  return `📱 **HƯỚNG DẪN ĐẶT HÀNG CHI TIẾT (7 BƯỚC):**

**BƯỚC 1: DUYỆT THỰC ĐƠN** 🍽️
• Vào mục "Thực đơn" hoặc chọn danh mục cụ thể
• Sử dụng thanh tìm kiếm để tìm món yêu thích
• Xem đánh giá và hình ảnh thực tế

**BƯỚC 2: CHỌN MÓN ĂN** 🛒
• Click vào món muốn đặt để xem chi tiết
• Đọc thành phần, mô tả, đánh giá khách hàng
• Chọn số lượng phù hợp

**BƯỚC 3: THÊM VÀO GIỎ** ➕
• Click "Thêm vào giỏ hàng"
• Tiếp tục chọn thêm món khác nếu muốn
• Kiểm tra biểu tượng giỏ hàng (góc trên phải)

**BƯỚC 4: XEM GIỎ HÀNG** 👀
• Click vào biểu tượng giỏ hàng
• Kiểm tra lại tất cả món đã chọn
• Điều chỉnh số lượng hoặc xóa món không cần

**BƯỚC 5: NHẬP THÔNG TIN** 📝
• Địa chỉ giao hàng chi tiết (số nhà, đường, quận)
• Số điện thoại liên hệ
• Ghi chú đặc biệt (nếu có)

**BƯỚC 6: ÁP DỤNG MÃ GIẢM GIÁ** 🎫
• Nhập mã voucher (nếu có)
• Kiểm tra điều kiện áp dụng
• Xem số tiền được giảm

**BƯỚC 7: THANH TOÁN** 💳
• Chọn phương thức thanh toán
• Xác nhận thông tin đơn hàng
• Click "Đặt hàng" để hoàn tất

⏰ **THỜI GIAN GIAO HÀNG:** 25-50 phút
💰 **ĐƠN TỐI THIỂU:** 50.000đ
🚚 **PHÍ GIAO HÀNG:** 15.000đ (MIỄN PHÍ từ 200.000đ)${firstTimeNote}

Bạn cần hỗ trợ thêm bước nào cụ thể không? 🤗`
}

const generatePaymentReply = async (context) => {
  let specificMethod = ""

  if (context.method) {
    switch (context.method) {
      case "vnpay":
        specificMethod = "\n🔥 **VNPay được chọn:** Thanh toán nhanh chóng qua thẻ ATM/Internet Banking, bảo mật cao!"
        break
      case "momo":
        specificMethod = "\n🔥 **MoMo được chọn:** Quét QR code hoặc liên kết số điện thoại, tiện lợi nhất!"
        break
      case "cod":
        specificMethod = "\n🔥 **COD được chọn:** Thanh toán khi nhận hàng, an toàn cho người mới!"
        break
      case "bank":
        specificMethod = "\n🔥 **Chuyển khoản được chọn:** Phù hợp cho đơn hàng lớn, có thông tin chi tiết!"
        break
    }
  }

  return `💳 **PHƯƠNG THỨC THANH TOÁN TẠI GREENEATS:**

✅ **1. THANH TOÁN KHI NHẬN HÀNG (COD)** - Phổ biến nhất
• Trả tiền mặt trực tiếp cho shipper
• An toàn, không cần lo bị lừa đảo
• Phù hợp với người mới sử dụng dịch vụ
• Kiểm tra hàng trước khi thanh toán

✅ **2. VNPay** - Nhanh chóng, bảo mật
• Thanh toán qua thẻ ATM/Internet Banking
• Hỗ trợ QR Code quét nhanh
• Bảo mật SSL 256-bit
• Xử lý giao dịch trong 30 giây

✅ **3. Ví MoMo** - Tiện lợi nhất
• Quét QR Code hoặc nhập số điện thoại
• Tích hợp ưu đãi từ MoMo
• Thanh toán 1 chạm
• Hoàn tiền nhanh nếu có vấn đề

✅ **4. Chuyển khoản ngân hàng** - Cho đơn lớn
• Chuyển trước, giao hàng sau
• Thông tin tài khoản được cung cấp sau khi đặt
• Phù hợp đơn hàng từ 500.000đ trở lên
• Có biên lai chuyển khoản làm bằng chứng

🔒 **BẢO MẬT:** Tất cả phương thức đều được mã hóa và bảo mật tuyệt đối!
💡 **GỢI Ý:** Lần đầu nên chọn COD, quen rồi chuyển sang VNPay/MoMo cho nhanh!${specificMethod}

Bạn muốn biết thêm chi tiết về phương thức nào? 💰`
}

const generateMenuReply = async (context, originalMessage) => {
  try {
    let foods = []

    if (context.category) {
      foods = await foodModel.find({ category: context.category }).limit(6)
    } else {
      // Tìm kiếm theo từ khóa trong tên hoặc mô tả
      const searchTerms = originalMessage.match(/\b\w+\b/g) || []
      const searchRegex = new RegExp(searchTerms.join("|"), "i")

      foods = await foodModel
        .find({
          $or: [{ name: searchRegex }, { description: searchRegex }],
        })
        .limit(6)

      if (foods.length === 0) {
        foods = await foodModel.find({}).limit(6)
      }
    }

    if (foods.length === 0) {
      return `🍽️ **THỰC ĐƠN GREENEATS:**

Xin lỗi, tôi không tìm thấy món ăn phù hợp với "${originalMessage}".

🔥 **CÁC DANH MỤC PHỔ BIẾN:**
• **Burger** - Hamburger bò, gà, chay đa dạng
• **Chicken** - Gà rán, nướng, sốt cay Hàn Quốc  
• **Pasta** - Mì Ý carbonara, bolognese, pesto
• **Salad** - Salad Caesar, Hy Lạp, trái cây
• **Sandwich** - Bánh mì kẹp thịt, chay, hải sản
• **Hotdog** - Xúc xích Đức, Mỹ, phô mai
• **Burito** - Bánh cuốn Mexico đậm đà
• **Tart** - Bánh tart ngọt, mặn cao cấp

💡 **GỢI Ý:** Hãy thử tìm kiếm cụ thể hơn như "burger bò" hoặc "pasta carbonara"!

Bạn muốn xem danh mục nào cụ thể? 😊`
    }

    let reply = `🍽️ **${context.category ? context.category.toUpperCase() : "MÓN ĂN PHÙ HỢP"}:**\n\n`

    foods.forEach((food, index) => {
      const rating = food.averageRating ? `⭐ ${food.averageRating.toFixed(1)}` : "⭐ Chưa có đánh giá"
      const soldCount = food.soldCount ? ` (Đã bán ${food.soldCount})` : ""

      reply += `${index + 1}. **${food.name}** - ${food.price.toLocaleString("vi-VN")}đ ${rating}${soldCount}\n`
      reply += `   📝 ${food.description.substring(0, 100)}...\n`

      if (food.ingredients && food.ingredients.length > 0) {
        reply += `   🥘 Thành phần: ${food.ingredients.slice(0, 3).join(", ")}\n`
      }
      reply += "\n"
    })

    reply += `💡 **CÁCH ĐẶT HÀNG:**\n`
    reply += `1. Vào mục "Thực đơn" trên website\n`
    reply += `2. Tìm món bạn thích\n`
    reply += `3. Click "Thêm vào giỏ hàng"\n`
    reply += `4. Tiến hành thanh toán\n\n`

    reply += `🎁 **ƯU ĐÃI HÔM NAY:** Miễn phí giao hàng cho đơn từ 200.000đ!\n\n`
    reply += `Bạn muốn biết thêm về món nào cụ thể? 🤔`

    return reply
  } catch (error) {
    console.error("Error generating menu reply:", error)
    return "🍽️ Xin lỗi, tôi đang gặp sự cố khi tải thực đơn. Vui lòng truy cập website để xem đầy đủ các món ăn!"
  }
}

const generateVoucherReply = async (context) => {
  try {
    const vouchers = await voucherModel
      .find({
        isActive: true,
        endDate: { $gte: new Date() },
        startDate: { $lte: new Date() },
      })
      .limit(8)

    if (vouchers.length === 0) {
      return `🎫 **MÃ GIẢM GIÁ:**

Hiện tại không có mã giảm giá công khai nào đang hoạt động.

🔥 **NHƯNG BẠN VẪN CÓ THỂ TIẾT KIỆM:**
• **Khách hàng mới:** Giảm 20% đơn đầu tiên (tự động)
• **Giờ vàng:** 14:00-16:00 giảm 15% mỗi ngày
• **Đơn từ 200k:** Miễn phí giao hàng
• **Cuối tuần:** Combo đặc biệt giá ưu đãi

📱 **CÁCH NHẬN MÃ GIẢM GIÁ:**
• Theo dõi fanpage Facebook GreenEats
• Đăng ký nhận email khuyến mãi
• Tham gia group khách hàng thân thiết
• Kiểm tra app thường xuyên

🎯 **MẸO HAY:** Đặt hàng vào giờ vàng (14h-16h) để được giảm 15% tự động!

Bạn có muốn tôi hướng dẫn cách áp dụng mã giảm giá không? 😊`
    }

    let reply = `🎫 **MÃ GIẢM GIÁ ĐANG CÓ HIỆU LỰC:**\n\n`

    vouchers.forEach((voucher, index) => {
      const discount =
        voucher.discountType === "percentage"
          ? `${voucher.discountValue}%`
          : `${voucher.discountValue.toLocaleString("vi-VN")}đ`

      const minOrder = voucher.minOrderValue ? ` (đơn từ ${voucher.minOrderValue.toLocaleString("vi-VN")}đ)` : ""

      const maxDiscount = voucher.maxDiscountAmount
        ? ` (tối đa ${voucher.maxDiscountAmount.toLocaleString("vi-VN")}đ)`
        : ""

      const endDate = new Date(voucher.endDate).toLocaleDateString("vi-VN")
      const remaining = voucher.usageLimit ? voucher.usageLimit - (voucher.usedCount || 0) : "Không giới hạn"

      reply += `${index + 1}. **Mã "${voucher.code}"** 🔥\n`
      reply += `   💰 Giảm ${discount}${minOrder}${maxDiscount}\n`
      reply += `   📅 HSD: ${endDate}\n`
      reply += `   📊 Còn lại: ${remaining} lượt\n`

      if (voucher.description) {
        reply += `   📝 ${voucher.description}\n`
      }
      reply += "\n"
    })

    reply += `📱 **CÁCH SỬ DỤNG MÃ GIẢM GIÁ:**\n`
    reply += `1. Thêm món vào giỏ hàng\n`
    reply += `2. Tại trang thanh toán, tìm ô "Mã giảm giá"\n`
    reply += `3. Nhập chính xác mã code\n`
    reply += `4. Click "Áp dụng" để kiểm tra\n`
    reply += `5. Xem số tiền được giảm và hoàn tất đặt hàng\n\n`

    reply += `💡 **LƯU Ý:** Mỗi mã chỉ sử dụng được 1 lần/tài khoản. Hãy chọn mã có lợi nhất!\n\n`
    reply += `Bạn cần hỗ trợ áp dụng mã nào cụ thể không? 🎁`

    return reply
  } catch (error) {
    console.error("Error generating voucher reply:", error)
    return "🎫 Xin lỗi, tôi đang gặp sự cố khi tải thông tin mã giảm giá. Vui lòng liên hệ hotline 1900-1234!"
  }
}

const generateOrderStatusReply = async (context, userId) => {
  let userOrderInfo = ""

  if (context.hasUserId && userId) {
    try {
      const recentOrders = await orderModel.find({ userId }).sort({ date: -1 }).limit(3)
      if (recentOrders.length > 0) {
        userOrderInfo = "\n🔍 **ĐƠN HÀNG GẦN NHẤT CỦA BẠN:**\n"
        recentOrders.forEach((order, index) => {
          const statusEmoji = {
            "Chờ xác nhận": "⏳",
            "Đang chuẩn bị": "👨‍🍳",
            "Đang giao": "🚚",
            "Đã giao": "✅",
            "Đã hủy": "❌",
          }

          userOrderInfo += `${index + 1}. Đơn #${order._id.toString().slice(-6)} - ${statusEmoji[order.status] || "📦"} ${order.status}\n`
          userOrderInfo += `   💰 ${order.amount.toLocaleString("vi-VN")}đ - ${new Date(order.date).toLocaleDateString("vi-VN")}\n`
        })
        userOrderInfo += "\n"
      }
    } catch (error) {
      console.error("Error getting user orders:", error)
    }
  }

  return `📋 **CÁCH KIỂM TRA TRẠNG THÁI ĐƠN HÀNG:**

${context.hasUserId ? "🔐 **BẠN ĐÃ ĐĂNG NHẬP:**" : "🔓 **CHƯA ĐĂNG NHẬP:**"}
${
  context.hasUserId
    ? `1. Vào mục **"Đơn hàng của tôi"** trên website
2. Xem danh sách tất cả đơn hàng
3. Click vào đơn cần kiểm tra để xem chi tiết
4. Theo dõi real-time qua thông báo`
    : `1. **Đăng nhập** tài khoản trước
2. Hoặc liên hệ hotline: **1900-1234**
3. Cung cấp số điện thoại đặt hàng để tra cứu`
}

📊 **CÁC TRẠNG THÁI ĐƠN HÀNG:**

⏳ **"Chờ xác nhận"** (2-5 phút)
• Đơn hàng mới được tạo
• Nhà hàng đang xem xét và xác nhận
• Có thể hủy miễn phí trong giai đoạn này

👨‍🍳 **"Đang chuẩn bị"** (15-25 phút)  
• Nhà hàng đã xác nhận và bắt đầu nấu
• Không thể hủy đơn (trừ trường hợp đặc biệt)
• Thời gian tùy thuộc độ phức tạp món ăn

🚚 **"Đang giao"** (10-20 phút)
• Shipper đã nhận hàng và đang trên đường
• Có thể theo dõi vị trí shipper (nếu có)
• Chuẩn bị tiền mặt nếu thanh toán COD

✅ **"Đã giao"** - Hoàn thành
• Đơn hàng đã được giao thành công
• Có thể đánh giá và bình luận
• Lưu vào lịch sử để đặt lại dễ dàng

❌ **"Đã hủy"** - Các lý do:
• Hết món, địa chỉ xa, thời tiết xấu
• Khách hàng yêu cầu hủy
• Hoàn tiền trong 1-3 ngày làm việc${userOrderInfo}

⚡ **HỖ TRỢ NHANH:** Gọi **1900-1234** nếu đơn hàng quá lâu không cập nhật!

Bạn cần kiểm tra đơn hàng cụ thể nào không? 📱`
}

const generateComplaintReply = async (context) => {
  const priorityNote =
    context.severity === "high" ? "\n🚨 **VẤN ĐỀ NGHIÊM TRỌNG:** Tôi sẽ chuyển ngay cho bộ phận xử lý khiếu nại!" : ""

  return `😔 **XIN LỖI VÌ SỰ BẤT TIỆN!**

Chúng tôi rất tiếc khi bạn không hài lòng với dịch vụ. GreenEats cam kết xử lý mọi khiếu nại một cách nghiêm túc và nhanh chóng.

🔥 **CÁCH XỬ LÝ KHIẾU NẠI NHANH NHẤT:**

1️⃣ **Chat trực tiếp với Admin:**
• Vào trang "Liên Hệ" → Đăng nhập → Chat ngay
• Mô tả chi tiết vấn đề + đính kèm hình ảnh
• Admin sẽ xử lý trong 5-10 phút

2️⃣ **Gọi Hotline khiếu nại:** 1900-1234
• Bấm phím 2 để chuyển bộ phận khiếu nại
• Hỗ trợ 24/7, ưu tiên xử lý ngay

3️⃣ **Email chi tiết:** complaint@greeneats.com
• Gửi kèm: Mã đơn hàng, hình ảnh, mô tả vấn đề
• Phản hồi trong 2 giờ

🎯 **CAM KẾT XỬ LÝ:**
• ⚡ Phản hồi trong 30 phút
• 💰 Hoàn tiền 100% nếu lỗi từ chúng tôi  
• 🎁 Bồi thường bằng voucher/món ăn miễn phí
• 📞 Gọi lại để xác nhận hài lòng

🔍 **THÔNG TIN CẦN CUNG CẤP:**
• Mã đơn hàng (nếu có)
• Thời gian đặt hàng
• Mô tả chi tiết vấn đề
• Hình ảnh minh chứng
• Số điện thoại liên hệ${priorityNote}

💝 **LỜI CAM ĐOAN:** Chúng tôi sẽ không để bạn thất vọng lần nữa!

Bạn muốn tôi hướng dẫn liên hệ trực tiếp với bộ phận khiếu nại ngay không? 🤝`
}

const generateRecommendationReply = async (context, userId) => {
  try {
    let foods = []
    let budgetNote = ""

    // Lấy món ăn dựa trên ngân sách
    if (context.budget === "low") {
      foods = await foodModel
        .find({ price: { $lt: 80000 } })
        .sort({ averageRating: -1 })
        .limit(5)
      budgetNote = "💰 **GỢI Ý TIẾT KIỆM (dưới 80k):**"
    } else if (context.budget === "high") {
      foods = await foodModel
        .find({ price: { $gt: 150000 } })
        .sort({ averageRating: -1 })
        .limit(5)
      budgetNote = "👑 **GỢI Ý CAO CẤP (trên 150k):**"
    } else {
      // Lấy món phổ biến nhất
      foods = await foodModel.find({}).sort({ soldCount: -1, averageRating: -1 }).limit(5)
      budgetNote = "🔥 **MÓN ĂN PHỔ BIẾN NHẤT:**"
    }

    // Nếu có userId, ưu tiên món ăn chưa từng đặt
    if (userId) {
      try {
        const userOrders = await orderModel.find({ userId })
        const orderedItems = userOrders.flatMap((order) => order.items.map((item) => item.name))

        // Lọc ra món chưa từng đặt
        const newFoods = foods.filter((food) => !orderedItems.includes(food.name))
        if (newFoods.length > 0) {
          foods = newFoods
          budgetNote += " (Món mới cho bạn)"
        }
      } catch (error) {
        console.error("Error filtering user orders:", error)
      }
    }

    if (foods.length === 0) {
      foods = await foodModel.find({}).sort({ averageRating: -1 }).limit(5)
    }

    let reply = `🎯 **TƯ VẤN MÓN ĂN DÀNH CHO BẠN:**\n\n${budgetNote}\n\n`

    foods.forEach((food, index) => {
      const rating = food.averageRating ? `⭐ ${food.averageRating.toFixed(1)}` : "⭐ Mới"
      const soldCount = food.soldCount ? ` (${food.soldCount} người đã thử)` : ""
      const priceRange = food.price < 80000 ? "💰 Tiết kiệm" : food.price > 150000 ? "👑 Cao cấp" : "💎 Phổ thông"

      reply += `${index + 1}. **${food.name}** - ${food.price.toLocaleString("vi-VN")}đ\n`
      reply += `   ${rating}${soldCount} | ${priceRange}\n`
      reply += `   📝 ${food.description.substring(0, 80)}...\n\n`
    })

    // Thêm combo gợi ý
    reply += `🍽️ **COMBO GỢI Ý HÔM NAY:**\n`
    reply += `• **Combo Tiết Kiệm:** Burger + Khoai tây + Nước = 99k\n`
    reply += `• **Combo Gia Đình:** 2 Chicken + 2 Pasta + 4 Nước = 299k\n`
    reply += `• **Combo Healthy:** Salad + Sandwich + Nước ép = 149k\n\n`

    reply += `🎁 **ƯU ĐÃI ĐẶC BIỆT:**\n`
    reply += `• Giờ vàng (14h-16h): Giảm 15% tất cả món\n`
    reply += `• Đơn từ 200k: Miễn phí giao hàng\n`
    reply += `• Khách mới: Giảm 20% đơn đầu tiên\n\n`

    reply += `💡 **MẸO HAY:** Đặt combo sẽ tiết kiệm hơn đặt từng món riêng lẻ!\n\n`
    reply += `Bạn thích món nào? Tôi có thể tư vấn thêm chi tiết! 😋`

    return reply
  } catch (error) {
    console.error("Error generating recommendation reply:", error)
    return "🎯 Xin lỗi, tôi đang gặp sự cố khi tải gợi ý món ăn. Vui lòng thử lại sau hoặc liên hệ hotline 1900-1234!"
  }
}

const generateDefaultReply = async (context, originalMessage) => {
  return `🤖 **XIN LỖI, TÔI CHƯA HIỂU RÕ CÂU HỎI CỦA BẠN**

Bạn vừa hỏi: "${originalMessage}"

🎯 **TÔI CÓ THỂ HỖ TRỢ BẠN:**

🍽️ **VỀ THỰC ĐƠN:**
• "Xem thực đơn burger"
• "Món nào ngon và rẻ?"
• "Gợi ý món ăn cho 2 người"

📱 **VỀ ĐẶT HÀNG:**
• "Hướng dẫn đặt hàng"
• "Cách thanh toán"
• "Thời gian giao hàng"

🎫 **VỀ KHUYẾN MÃI:**
• "Có mã giảm giá không?"
• "Voucher hôm nay"
• "Ưu đãi khách hàng mới"

📋 **VỀ ĐƠN HÀNG:**
• "Kiểm tra đơn hàng"
• "Hủy đơn hàng"
• "Thay đổi địa chỉ giao hàng"

💬 **VỀ HỖ TRỢ:**
• "Liên hệ admin"
• "Khiếu nại đơn hàng"
• "Báo cáo vấn đề"

🔍 **CÁCH HỎI HIỆU QUẢ:**
• Hỏi cụ thể: "Burger bò giá bao nhiêu?"
• Nêu rõ nhu cầu: "Tôi muốn đặt đồ ăn cho 4 người"
• Cung cấp ngữ cảnh: "Đơn hàng #123456 chưa được giao"

📞 **HỖ TRỢ TRỰC TIẾP:**
• **Hotline:** 1900-1234 (24/7)
• **Chat admin:** Trang "Liên Hệ" → Đăng nhập
• **Email:** support@greeneats.com

💡 **GỢI Ý:** Hãy thử hỏi lại bằng cách khác hoặc chọn một trong các chủ đề trên!

Bạn muốn hỏi về vấn đề gì cụ thể? 🤔`
}

export { chatWithAI }
