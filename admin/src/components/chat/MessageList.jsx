"use client"

import { useRef, useEffect } from "react"
import { Loader, ArrowDown } from "lucide-react"

const MessageList = ({
  messages,
  loadedImages,
  onImageLoad,
  onImageError,
  baseUrl,
  isNearBottom,
  showScrollButton,
  unreadCount,
  onScroll,
  scrollToBottom,
}) => {
  const messagesContainerRef = useRef(null)

  // Add scroll event listener
  useEffect(() => {
    const container = messagesContainerRef.current
    if (container) {
      container.addEventListener("scroll", onScroll)
      return () => container.removeEventListener("scroll", onScroll)
    }
  }, [onScroll])

  return (
    <div className="flex-1 p-4 overflow-y-auto relative" ref={messagesContainerRef}>
      {messages.length === 0 ? (
        <div className="text-center text-gray-400 mt-8">
          <p>Không có tin nhắn nào</p>
        </div>
      ) : (
        messages.map((msg, index) => (
          <div key={msg._id || index} className={`mb-4 flex ${msg.isAdmin ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[70%] p-3 rounded-lg ${msg.isAdmin ? "bg-blue-600" : "bg-gray-700"}`}>
              {msg.content && <p>{msg.content}</p>}

              {msg.image && (
                <div className="relative mt-2">
                  {!loadedImages[msg._id] && (
                    <div className="flex justify-center items-center py-4">
                      <Loader className="animate-spin h-6 w-6 text-white" />
                    </div>
                  )}
                  <img
                    src={`${baseUrl}/images/${msg.image}`}
                    alt="Message attachment"
                    className={`rounded-md max-w-full cursor-pointer ${!loadedImages[msg._id] ? "hidden" : ""}`}
                    style={{ maxHeight: "200px" }}
                    onClick={() => window.open(`${baseUrl}/images/${msg.image}`, "_blank")}
                    onLoad={() => onImageLoad(msg._id)}
                    onError={() => onImageError(msg._id)}
                  />
                </div>
              )}

              <div className="text-xs mt-1 text-gray-300">{new Date(msg.createdAt).toLocaleTimeString()}</div>
            </div>
          </div>
        ))
      )}

      {/* Scroll to bottom button with unread count */}
      {showScrollButton && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-4 right-4 bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition-all flex items-center justify-center"
          title="Cuộn xuống tin nhắn mới nhất"
        >
          <ArrowDown size={20} />
          {unreadCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      )}
    </div>
  )
}

export default MessageList
