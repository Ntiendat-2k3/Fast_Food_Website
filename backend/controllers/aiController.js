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
  return `Bạn là trợ lý ảo thông minh của GreenEats - một ứng dụng đặt đồ ăn nhanh tại Việt Nam.

THÔNG TIN VỀ GREENEATS:
- Tên: GreenEats
- Dịch vụ: Đặt đồ ăn nhanh online
- Thời gian hoạt động: 6:00 - 23:00 hàng ngày
- Hotline: 1900-1234
- Email: support@greeneats.com
- Thời gian giao hàng: 25-50 phút tùy khu vực
- Đơn hàng tối thiểu: 50.000đ

THỰC ĐƠN HIỆN TẠI:
${contextData.menuInfo}

MÃ GIẢM GIÁ ĐANG CÓ:
${contextData.voucherInfo}

PHƯƠNG THỨC THANH TOÁN:
- Thanh toán khi nhận hàng (COD)
- VNPay (thẻ ATM/Internet Banking)
- Ví MoMo
- Chuyển khoản ngân hàng

THÔNG TIN NGƯỜI DÙNG:
${userContext}

HƯỚNG DẪN TRẢI NGHIỆM:
1. Luôn thân thiện, nhiệt tình và chuyên nghiệp
2. Trả lời bằng tiếng Việt tự nhiên, dễ hiểu
3. Sử dụng emoji phù hợp để tạo cảm xúc tích cực
4. Đưa ra gợi ý cụ thể và hữu ích
5. Nếu không biết thông tin, hướng dẫn liên hệ hotline
6. Luôn kết thúc bằng câu hỏi để tiếp tục hỗ trợ
7. Ưu tiên gợi ý món ăn và khuyến khích đặt hàng
8. Sử dụng thông tin thực tế từ database, không bịa đặt

NHIỆM VỤ CHÍNH:
- Tư vấn món ăn phù hợp
- Hướng dẫn đặt hàng
- Hỗ trợ kiểm tra đơn hàng
- Giải đáp thắc mắc về dịch vụ
- Xử lý khiếu nại một cách chuyên nghiệp`
}

// Lấy dữ liệu context từ database
const getContextData = async () => {
  try {
    // Lấy danh sách món ăn phổ biến
    const popularFoods = await foodModel.find({}).limit(10).sort({ createdAt: -1 })

    // Lấy voucher đang hoạt động
    const activeVouchers = await voucherModel
      .find({
        isPublic: true,
        expiryDate: { $gt: new Date() },
        isActive: true,
      })
      .limit(5)

    // Tạo thông tin menu
    const menuInfo = popularFoods
      .map(
        (food) =>
          `- ${food.name}: ${food.price.toLocaleString("vi-VN")}đ (${food.category}) - ${food.description.substring(0, 100)}`,
      )
      .join("\n")

    // Tạo thông tin voucher
    const voucherInfo =
      activeVouchers.length > 0
        ? activeVouchers
            .map((voucher) => {
              const discount =
                voucher.discountType === "percentage"
                  ? `${voucher.discountValue}%`
                  : `${voucher.discountValue.toLocaleString("vi-VN")}đ`

              const minOrder = voucher.minimumOrderAmount
                ? ` (đơn từ ${voucher.minimumOrderAmount.toLocaleString("vi-VN")}đ)`
                : ""

              return `- Mã ${voucher.code}: Giảm ${discount}${minOrder} - Hết hạn ${new Date(voucher.expiryDate).toLocaleDateString("vi-VN")}`
            })
            .join("\n")
        : "Hiện tại không có mã giảm giá công khai"

    return {
      menuInfo: menuInfo || "Đang cập nhật thực đơn",
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
  if (message.includes("xin chào") || message.includes("chào") || message.includes("hello")) {
    return "greeting"
  } else if (message.includes("món") || message.includes("thực đơn") || message.includes("đồ ăn")) {
    return "menu_inquiry"
  } else if (message.includes("mã giảm giá") || message.includes("voucher") || message.includes("khuyến mãi")) {
    return "voucher_inquiry"
  }
  return "unknown"
}

const getFoodRecommendations = async (message) => {
  try {
    let category = null
    if (message.includes("burger")) category = "Burger"
    else if (message.includes("pizza")) category = "Pizza"
    else if (message.includes("gà")) category = "Gà"

    const query = category ? { category } : {}
    const foods = await foodModel.find(query).limit(5)
    return foods
  } catch (error) {
    return []
  }
}

const generateFoodReply = (foods, originalMessage) => {
  if (!foods || foods.length === 0) {
    return `Xin lỗi, tôi không tìm thấy món ăn phù hợp. Bạn có thể truy cập mục "Thực đơn" để xem tất cả món ăn của chúng tôi.`
  }

  let reply = `🍽️ Đây là những món ăn tôi tìm được cho bạn:\n\n`
  foods.forEach((food, index) => {
    reply += `${index + 1}. **${food.name}** - ${food.price.toLocaleString("vi-VN")}đ\n`
  })
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
