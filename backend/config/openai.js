// Cấu hình OpenAI API
import dotenv from "dotenv"
dotenv.config()

const OPENAI_API_KEY = process.env.OPENAI_API_KEY

if (!OPENAI_API_KEY) {
  console.error("OPENAI_API_KEY không được cấu hình trong biến môi trường!")
  console.error("Chatbot sẽ hoạt động ở chế độ fallback.")
}

export { OPENAI_API_KEY }
