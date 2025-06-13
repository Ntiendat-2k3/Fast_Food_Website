import { MessageCircle } from "lucide-react"

const ChatHeader = () => {
  return (
    <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-slate-900 p-4">
      <div className="flex items-center">
        <MessageCircle className="mr-3" size={24} />
        <div>
          <h2 className="text-xl font-semibold">Chat Với Chúng Tôi</h2>
          <p className="text-sm opacity-90">Chúng tôi sẽ phản hồi trong thời gian sớm nhất</p>
        </div>
      </div>
    </div>
  )
}

export default ChatHeader
