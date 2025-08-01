import dotenv from "dotenv"

dotenv.config()

export const OPENAI_API_KEY = process.env.OPENAI_API_KEY || null

// Log để debug (không hiển thị key đầy đủ)
if (OPENAI_API_KEY) {
  console.log("✅ OpenAI API Key loaded:", OPENAI_API_KEY.substring(0, 10) + "...")
} else {
  console.log("⚠️ OpenAI API Key not found - using fallback mode")
}
