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

${contextData.menuInfo}

${contextData.voucherInfo}

💳 PHƯƠNG THỨC THANH TOÁN:
- Thanh toán khi nhận hàng (COD)
- VNPay (thẻ ATM/Internet Banking)
- Ví MoMo
- Chuyển khoản ngân hàng

👤 THÔNG TIN NGƯỜI DÙNG: ${userContext || "Khách hàng mới"}

📋 HƯỚNG DẪN QUAN TRỌNG:
1. LUÔN sử dụng thông tin CHÍNH XÁC từ thực đơn và voucher ở trên
2. KHÔNG bao giờ nói "không có" nếu thực đơn có món đó
3. KHÔNG bao giờ nói "không có voucher" nếu danh sách voucher có
4. Trả lời bằng tiếng Việt thân thiện, sử dụng emoji phù hợp
5. Luôn đưa ra gợi ý cụ thể và khuyến khích đặt hàng
6. Kết thúc bằng câu hỏi để tiếp tục hỗ trợ

🎯 NHIỆM VỤ:
- Tư vấn món ăn từ thực đơn có sẵn
- Hướng dẫn sử dụng mã giảm giá
- Hỗ trợ đặt hàng và thanh toán
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
      return "Xin chào! Tôi là trợ lý ảo của GreenEats. Tôi có thể giúp bạn tìm món ăn ngon, kiểm tra đơn hàng hoặc giải đáp thắc mắc. Bạn cần hỗ trợ gì?"

    case "menu_inquiry":
      const foods = await getFoodRecommendations(message)
      return generateFoodReply(foods, message)

    case "voucher_inquiry":
      const vouchers = await getActiveVouchers()
      return generateVoucherReply(vouchers)

    default:
      return "Xin lỗi, tôi đang gặp sự cố kỹ thuật. Vui lòng liên hệ hotline 1900-1234 để được hỗ trợ trực tiếp, hoặc thử lại sau ít phút."
  }
}

// Các hàm hỗ trợ từ version cũ (giữ lại để fallback)
const analyzeIntent = (message) => {
  const lowerMessage = message.toLowerCase()

  if (lowerMessage.includes("xin chào") || lowerMessage.includes("chào") || lowerMessage.includes("hello")) {
    return "greeting"
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
