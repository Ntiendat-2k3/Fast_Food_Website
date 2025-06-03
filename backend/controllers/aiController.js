import { openai } from "@ai-sdk/openai"
import { generateText } from "ai"
import foodModel from "../models/foodModel.js"
import voucherModel from "../models/voucherModel.js"
import { OPENAI_API_KEY } from "../config/openai.js"

// Hàm xử lý chat với OpenAI GPT
const chatWithAI = async (req, res) => {
  try {
    const { message, userContext, history } = req.body

    // Kiểm tra xem có API key không
    if (!OPENAI_API_KEY) {
      // Nếu không có API key, sử dụng fallback
      const fallbackReply = await getFallbackReply(message)
      return res.json({
        success: true,
        reply: fallbackReply + "\n\n(Lưu ý: Đang sử dụng chế độ hỗ trợ cơ bản do chưa cấu hình OpenAI API)",
      })
    }

    // Lấy thông tin context từ database
    const contextData = await getContextData()

    // Tạo system prompt với thông tin về GreenEats
    const systemPrompt = createSystemPrompt(contextData, userContext)

    // Tạo conversation history cho OpenAI
    const messages = [
      { role: "system", content: systemPrompt },
      ...formatChatHistory(history),
      { role: "user", content: message },
    ]

    console.log("Gửi yêu cầu đến OpenAI API...")

    // Gọi OpenAI API với API key từ biến môi trường
    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      messages: messages,
      temperature: 0.7,
      maxTokens: 500,
      apiKey: OPENAI_API_KEY, // Sử dụng API key từ biến môi trường
    })

    console.log("Nhận phản hồi từ OpenAI API thành công")

    // Trả về phản hồi
    res.json({ success: true, reply: text })
  } catch (error) {
    console.error("Error in OpenAI chat:", error)

    // Fallback về chatbot cũ nếu OpenAI lỗi
    const fallbackReply = await getFallbackReply(req.body.message)
    res.json({
      success: true,
      reply: fallbackReply + "\n\n(Lưu ý: Đang sử dụng chế độ hỗ trợ cơ bản do sự cố kỹ thuật với OpenAI API)",
    })
  }
}

// Tạo system prompt cho OpenAI
const createSystemPrompt = (contextData, userContext) => {
  return `Bạn là trợ lý ảo thông minh của GreenEats - ứng dụng đặt đồ ăn nhanh tại Việt Nam.

🏪 THÔNG TIN GREENEATS:
- Tên: GreenEats
- Dịch vụ: Đặt đồ ăn nhanh online
- Giờ hoạt động: 6:00 - 23:00 hàng ngày
- Hotline: 1900-1234
- Email: support@greeneats.com
- Thời gian giao hàng: 25-50 phút
- Đơn hàng tối thiểu: 50.000đ
- Phí giao hàng: 15.000đ (miễn phí cho đơn từ 200.000đ)

${contextData.menuInfo}

${contextData.voucherInfo}

💳 PHƯƠNG THỨC THANH TOÁN:
- Thanh toán khi nhận hàng (COD)
- VNPay (thẻ ATM/Internet Banking)
- Ví MoMo
- Chuyển khoản ngân hàng

🌐 HƯỚNG DẪN SỬ DỤNG WEBSITE:

📱 CÁCH ĐẶT HÀNG:
1. Chọn món ăn từ thực đơn
2. Thêm vào giỏ hàng
3. Xem giỏ hàng và điều chỉnh số lượng
4. Nhập thông tin giao hàng
5. Chọn phương thức thanh toán
6. Xác nhận đặt hàng

💬 CÁCH LIÊN HỆ VỚI ADMIN/CHỦ CỬA HÀNG:
- Vào trang "Liên Hệ" trên website
- Đăng nhập tài khoản (bắt buộc để chat)
- Sử dụng khung chat trực tiếp với admin
- Có thể gửi tin nhắn văn bản và hình ảnh
- Admin sẽ phản hồi trong giờ hành chính

🔐 QUẢN LÝ TÀI KHOẢN:
- Đăng ký/Đăng nhập ở góc trên phải
- Xem lịch sử đơn hàng trong "Đơn hàng của tôi"
- Quản lý danh sách yêu thích
- Cập nhật thông tin cá nhân

📋 CÁC TÍNH NĂNG KHÁC:
- Tìm kiếm món ăn theo tên hoặc danh mục
- Đánh giá và bình luận món ăn
- Theo dõi trạng thái đơn hàng real-time
- Nhận thông báo về khuyến mãi

🎯 TRẠNG THÁI ĐỚN HÀNG:
- "Đang xử lý": Nhà hàng đang chuẩn bị
- "Đang giao": Shipper đang trên đường
- "Đã giao": Hoàn thành thành công
- "Đã hủy": Đơn hàng bị hủy

👤 THÔNG TIN NGƯỜI DÙNG: ${userContext || "Khách hàng mới"}

📋 HƯỚNG DẪN QUAN TRỌNG:
1. LUÔN sử dụng thông tin CHÍNH XÁC từ thực đơn và voucher
2. Đưa ra hướng dẫn CỤ THỂ, CHI TIẾT cho từng câu hỏi
3. Khi được hỏi về liên hệ admin: Hướng dẫn vào trang "Liên Hệ" → Đăng nhập → Sử dụng chat trực tiếp
4. Khi được hỏi về đặt hàng: Hướng dẫn từng bước cụ thể
5. Khi được hỏi về thanh toán: Giải thích các phương thức có sẵn
6. Trả lời bằng tiếng Việt thân thiện, sử dụng emoji phù hợp
7. Luôn đưa ra gợi ý cụ thể và khuyến khích sử dụng dịch vụ
8. Kết thúc bằng câu hỏi để tiếp tục hỗ trợ

🎯 NHIỆM VỤ:
- Tư vấn món ăn từ thực đơn có sẵn
- Hướng dẫn sử dụng website chi tiết
- Hướng dẫn đặt hàng từng bước
- Hướng dẫn liên hệ admin/support
- Giải thích các tính năng của website
- Hỗ trợ xử lý vấn đề kỹ thuật cơ bản
- Hướng dẫn sử dụng mã giảm giá
- Giải đáp thắc mắc về dịch vụ`
}

// Lấy dữ liệu context từ database
const getContextData = async () => {
  try {
    // Lấy TẤT CẢ món ăn theo từng category
    const allCategories = ["Burger", "Burito", "Chicken", "Hotdog", "Pasta", "Salad", "Sandwich", "Tart"]

    let menuInfo = "**THỰC ĐƠN GREENEATS:**\n\n"

    for (const category of allCategories) {
      const categoryFoods = await foodModel.find({ category }).limit(10)

      if (categoryFoods.length > 0) {
        menuInfo += `🍽️ **${category.toUpperCase()}:**\n`
        categoryFoods.forEach((food) => {
          menuInfo += `- ${food.name}: ${food.price.toLocaleString("vi-VN")}đ - ${food.description.substring(0, 80)}...\n`
        })
        menuInfo += "\n"
      }
    }

    // Nếu không có món nào, lấy tất cả món có sẵn
    if (menuInfo === "**THỰC ĐƠN GREENEATS:**\n\n") {
      const allFoods = await foodModel.find({}).limit(20)
      menuInfo = "**THỰC ĐƠN HIỆN CÓ:**\n"
      allFoods.forEach((food) => {
        menuInfo += `- ${food.name}: ${food.price.toLocaleString("vi-VN")}đ (${food.category}) - ${food.description.substring(0, 80)}...\n`
      })
    }

    // Lấy voucher đang hoạt động
    const activeVouchers = await voucherModel
      .find({
        isActive: true,
        endDate: { $gte: new Date() },
        startDate: { $lte: new Date() },
      })
      .limit(10)

    // Tạo thông tin voucher chi tiết
    let voucherInfo = ""
    if (activeVouchers.length > 0) {
      voucherInfo = "**MÃ GIẢM GIÁ ĐANG CÓ:**\n"
      activeVouchers.forEach((voucher, index) => {
        const discount =
          voucher.discountType === "percentage"
            ? `${voucher.discountValue}%`
            : `${voucher.discountValue.toLocaleString("vi-VN")}đ`

        const minOrder = voucher.minOrderValue ? ` (đơn từ ${voucher.minOrderValue.toLocaleString("vi-VN")}đ)` : ""

        const endDate = new Date(voucher.endDate).toLocaleDateString("vi-VN")

        voucherInfo += `${index + 1}. Mã "${voucher.code}": Giảm ${discount}${minOrder} - HSD: ${endDate}\n`
        if (voucher.description) {
          voucherInfo += `   📝 ${voucher.description}\n`
        }
      })
    } else {
      voucherInfo = "Hiện tại không có mã giảm giá nào đang hoạt động."
    }

    return {
      menuInfo,
      voucherInfo,
    }
  } catch (error) {
    console.error("Error getting context data:", error)
    return {
      menuInfo: "Vui lòng truy cập website để xem thực đơn đầy đủ",
      voucherInfo: "Vui lòng liên hệ hotline để biết thông tin khuyến mãi",
    }
  }
}

// Format chat history cho OpenAI
const formatChatHistory = (history) => {
  if (!history || history.length === 0) return []

  return history.slice(-6).map((msg) => ({
    role: msg.role === "assistant" ? "assistant" : "user",
    content: msg.content,
  }))
}

// Fallback reply khi OpenAI lỗi
const getFallbackReply = async (message) => {
  const intent = analyzeIntent(message.toLowerCase())

  switch (intent) {
    case "greeting":
      return "Xin chào! 👋 Tôi là trợ lý ảo của GreenEats. Tôi có thể giúp bạn:\n\n🍽️ Tìm món ăn ngon\n📱 Hướng dẫn đặt hàng\n💬 Cách liên hệ admin\n🎫 Kiểm tra mã giảm giá\n📋 Theo dõi đơn hàng\n\nBạn cần hỗ trợ gì?"

    case "contact_inquiry":
      return `💬 **CÁCH LIÊN HỆ VỚI ADMIN/CHỦ CỬA HÀNG:**

📱 **Chat trực tiếp:**
1. Vào trang "Liên Hệ" trên website
2. Đăng nhập tài khoản (bắt buộc)
3. Sử dụng khung chat ở bên phải
4. Gửi tin nhắn văn bản hoặc hình ảnh
5. Admin sẽ phản hồi trong giờ hành chính

📞 **Các cách khác:**
• Hotline: 1900-1234 (6:00-23:00)
• Email: support@greeneats.com
• Địa chỉ: 123 Đường Nguyễn Văn Linh, Q7, TP.HCM

Bạn có cần hướng dẫn thêm về cách sử dụng chat không? 😊`

    case "order_guide":
      return `📱 **HƯỚNG DẪN ĐẶT HÀNG CHI TIẾT:**

**Bước 1:** Chọn món ăn
• Duyệt thực đơn theo danh mục
• Click vào món muốn đặt
• Chọn số lượng và thêm vào giỏ

**Bước 2:** Xem giỏ hàng
• Click biểu tượng giỏ hàng
• Kiểm tra món đã chọn
• Điều chỉnh số lượng nếu cần

**Bước 3:** Thanh toán
• Nhập địa chỉ giao hàng
• Chọn phương thức thanh toán
• Áp dụng mã giảm giá (nếu có)
• Xác nhận đặt hàng

⏰ Thời gian giao: 25-50 phút
💰 Đơn tối thiểu: 50.000đ

Bạn cần hỗ trợ thêm bước nào không? 🤔`

    case "payment_inquiry":
      return `💳 **PHƯƠNG THỨC THANH TOÁN:**

✅ **Thanh toán khi nhận hàng (COD)**
• Trả tiền mặt cho shipper
• An toàn, tiện lợi

✅ **VNPay**
• Thẻ ATM/Internet Banking
• Thanh toán online ngay

✅ **Ví MoMo**
• Quét QR hoặc nhập số điện thoại
• Nhanh chóng, bảo mật

✅ **Chuyển khoản ngân hàng**
• Chuyển trước khi giao hàng
• Thông tin TK sẽ được cung cấp

💡 **Lưu ý:** Tất cả phương thức đều an toàn và được bảo mật!

Bạn muốn biết thêm về phương thức nào? 💰`

    case "menu_inquiry":
      const foods = await getFoodRecommendations(message)
      return generateFoodReply(foods, message)

    case "voucher_inquiry":
      const vouchers = await getActiveVouchers()
      return generateVoucherReply(vouchers)

    case "order_status":
      return `📋 **CÁCH KIỂM TRA ĐỚN HÀNG:**

**Nếu đã đăng nhập:**
1. Vào "Đơn hàng của tôi"
2. Xem danh sách đơn hàng
3. Click vào đơn cần kiểm tra

**Trạng thái đơn hàng:**
🔄 Đang xử lý - Nhà hàng đang chuẩn bị
🚚 Đang giao - Shipper đang trên đường
✅ Đã giao - Hoàn thành thành công
❌ Đã hủy - Đơn hàng bị hủy

**Nếu chưa đăng nhập:**
• Liên hệ hotline: 1900-1234
• Chat với admin qua trang Liên Hệ

Bạn cần hỗ trợ kiểm tra đơn hàng cụ thể không? 📱`

    default:
      return `Xin lỗi, tôi chưa hiểu rõ câu hỏi của bạn. 😅

🤖 **Tôi có thể hỗ trợ bạn:**
• Tìm món ăn và tư vấn thực đơn
• Hướng dẫn đặt hàng chi tiết
• Cách liên hệ admin/chủ cửa hàng
• Thông tin mã giảm giá
• Kiểm tra trạng thái đơn hàng
• Hướng dẫn thanh toán

Hoặc bạn có thể:
📞 Gọi hotline: 1900-1234
💬 Chat trực tiếp với admin tại trang "Liên Hệ"

Bạn muốn hỏi về vấn đề gì cụ thể? 🤔`
  }
}

// Các hàm hỗ trợ từ version cũ (giữ lại để fallback)
const analyzeIntent = (message) => {
  const lowerMessage = message.toLowerCase()

  if (lowerMessage.includes("xin chào") || lowerMessage.includes("chào") || lowerMessage.includes("hello")) {
    return "greeting"
  } else if (
    lowerMessage.includes("liên hệ") ||
    lowerMessage.includes("nhắn tin") ||
    lowerMessage.includes("chat") ||
    lowerMessage.includes("admin") ||
    lowerMessage.includes("chủ cửa hàng") ||
    lowerMessage.includes("hỗ trợ")
  ) {
    return "contact_inquiry"
  } else if (
    lowerMessage.includes("đặt hàng") ||
    lowerMessage.includes("order") ||
    lowerMessage.includes("mua") ||
    lowerMessage.includes("cách đặt")
  ) {
    return "order_guide"
  } else if (
    lowerMessage.includes("thanh toán") ||
    lowerMessage.includes("payment") ||
    lowerMessage.includes("trả tiền")
  ) {
    return "payment_inquiry"
  } else if (
    lowerMessage.includes("món") ||
    lowerMessage.includes("thực đơn") ||
    lowerMessage.includes("đồ ăn") ||
    lowerMessage.includes("burger") ||
    lowerMessage.includes("burito") ||
    lowerMessage.includes("chicken") ||
    lowerMessage.includes("gà") ||
    lowerMessage.includes("hotdog") ||
    lowerMessage.includes("pasta") ||
    lowerMessage.includes("salad") ||
    lowerMessage.includes("sandwich") ||
    lowerMessage.includes("tart") ||
    lowerMessage.includes("bánh") ||
    lowerMessage.includes("mì")
  ) {
    return "menu_inquiry"
  } else if (
    lowerMessage.includes("mã giảm giá") ||
    lowerMessage.includes("voucher") ||
    lowerMessage.includes("khuyến mãi")
  ) {
    return "voucher_inquiry"
  } else if (
    lowerMessage.includes("đơn hàng") ||
    lowerMessage.includes("kiểm tra") ||
    lowerMessage.includes("trạng thái")
  ) {
    return "order_status"
  }
  return "unknown"
}

const getFoodRecommendations = async (message) => {
  try {
    let category = null
    const lowerMessage = message.toLowerCase()

    // Mapping các từ khóa với categories
    if (lowerMessage.includes("burger")) {
      category = "Burger"
    } else if (lowerMessage.includes("burito") || lowerMessage.includes("burrito")) {
      category = "Burito"
    } else if (lowerMessage.includes("gà") || lowerMessage.includes("chicken")) {
      category = "Chicken"
    } else if (lowerMessage.includes("hotdog") || lowerMessage.includes("hot dog")) {
      category = "Hotdog"
    } else if (lowerMessage.includes("pasta") || lowerMessage.includes("mì ý")) {
      category = "Pasta"
    } else if (lowerMessage.includes("salad") || lowerMessage.includes("xa lách")) {
      category = "Salad"
    } else if (lowerMessage.includes("sandwich") || lowerMessage.includes("bánh mì")) {
      category = "Sandwich"
    } else if (lowerMessage.includes("tart") || lowerMessage.includes("bánh tart")) {
      category = "Tart"
    }

    const query = category ? { category } : {}
    const foods = await foodModel.find(query).limit(5)
    return foods
  } catch (error) {
    console.error("Error in getFoodRecommendations:", error)
    return []
  }
}

const generateFoodReply = (foods, originalMessage) => {
  if (!foods || foods.length === 0) {
    return `Xin lỗi, tôi không tìm thấy món ăn phù hợp với yêu cầu "${originalMessage}".

🍽️ **Thực đơn của chúng tôi bao gồm:**
• Burger - Hamburger thơm ngon
• Burito - Bánh cuốn Mexico
• Chicken - Các món gà chiên, nướng
• Hotdog - Xúc xích nướng
• Pasta - Mì Ý đa dạng
• Salad - Salad tươi mát
• Sandwich - Bánh mì sandwich
• Tart - Bánh tart ngọt ngào

Bạn có thể truy cập mục "Thực đơn" để xem tất cả món ăn chi tiết! 😊`
  }

  let reply = `🍽️ **Đây là những món ăn tôi tìm được cho bạn:**\n\n`
  foods.forEach((food, index) => {
    reply += `${index + 1}. **${food.name}** - ${food.price.toLocaleString("vi-VN")}đ\n`
    reply += `   📝 ${food.description.substring(0, 80)}...\n\n`
  })

  reply += `💡 **Gợi ý:** Bạn có thể đặt hàng ngay trên website hoặc hỏi tôi thêm về món nào bạn quan tâm!`

  return reply
}

const getActiveVouchers = async () => {
  try {
    return await voucherModel
      .find({
        isPublic: true,
        expiryDate: { $gt: new Date() },
        isActive: true,
      })
      .limit(5)
  } catch (error) {
    return []
  }
}

const generateVoucherReply = (vouchers) => {
  if (!vouchers || vouchers.length === 0) {
    return "🎫 Hiện tại không có mã giảm giá công khai nào đang hoạt động."
  }

  let reply = `🎫 **Mã giảm giá đang có hiệu lực:**\n\n`
  vouchers.forEach((voucher, index) => {
    reply += `${index + 1}. **Mã: ${voucher.code}**\n`
    if (voucher.discountType === "percentage") {
      reply += `   🎯 Giảm ${voucher.discountValue}%\n`
    } else {
      reply += `   🎯 Giảm ${voucher.discountValue.toLocaleString("vi-VN")}đ\n`
    }
  })
  return reply
}

export { chatWithAI }
