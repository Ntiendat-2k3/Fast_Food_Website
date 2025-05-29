"use client";

import { useState, useEffect, useRef } from "react";
import { Send, Bot, User, X, Loader2 } from "lucide-react";
import { useContext } from "react";
import { StoreContext } from "../context/StoreContext";
import axios from "axios";
import { motion } from "framer-motion";

const formatMessage = (content) => {
  // Xử lý markdown cơ bản
  return content
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/`(.*?)`/g, "<code>$1</code>");
};

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const AIAssistant = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Xin chào! Tôi là trợ lý ảo của GreenEats. Tôi có thể giúp bạn:\n\n• Tìm kiếm món ăn\n• Kiểm tra đơn hàng\n• Thông tin mã giảm giá\n• Hướng dẫn đặt hàng\n• Giải đáp thắc mắc\n\nBạn cần hỗ trợ gì?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const { url, token, user } = useContext(StoreContext);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = async () => {
    if (input.trim() === "") return;

    // Add user message to chat
    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput("");
    setIsLoading(true);

    try {
      // Get user context if logged in
      let userContext = "";
      if (token && user) {
        userContext = `Người dùng đã đăng nhập: ${user.name}, Email: ${user.email}`;
      } else {
        userContext = "Khách chưa đăng nhập";
      }

      // Send to backend AI endpoint
      const response = await axios.post(`${url}/api/ai/chat`, {
        message: currentInput,
        userContext: userContext,
        history: messages.slice(-6), // Send last 6 messages for context
      });

      if (response.data.success) {
        // Add AI response to chat
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: response.data.reply,
          },
        ]);
      } else {
        // Handle error
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              "Xin lỗi, tôi đang gặp sự cố. Vui lòng thử lại sau hoặc liên hệ hotline: 1900-1234 để được hỗ trợ.",
          },
        ]);
      }
    } catch (error) {
      console.error("Error in AI chat:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Xin lỗi, đã xảy ra lỗi khi xử lý yêu cầu của bạn. Vui lòng thử lại sau.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Quick action buttons
  const quickActions = [
    { text: "Xem thực đơn", action: "menu" },
    { text: "Mã giảm giá", action: "voucher" },
    { text: "Cách đặt hàng", action: "order_guide" },
    { text: "Thời gian giao hàng", action: "delivery" },
  ];

  const handleQuickAction = (action) => {
    let message = "";
    switch (action) {
      case "menu":
        message = "Tôi muốn xem thực đơn";
        break;
      case "voucher":
        message = "Có mã giảm giá nào không?";
        break;
      case "order_guide":
        message = "Hướng dẫn cách đặt hàng";
        break;
      case "delivery":
        message = "Thời gian giao hàng bao lâu?";
        break;
    }
    setInput(message);
  };

  if (!isOpen) return null;

  return (
    <motion.div
      key="chat-wrapper"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.25 }}
      className="fixed bottom-4 right-4 w-80 sm:w-96 h-[600px] bg-white dark:bg-gray-800 rounded-xl shadow-2xl flex flex-col z-50 border border-gray-200 dark:border-gray-700 overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 p-4 flex items-center justify-between">
        <div className="flex items-center">
          <div className="bg-white/20 p-2 rounded-full mr-3">
            <Bot className="text-white" size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-white">GreenEats Assistant</h3>
            <p className="text-white/80 text-xs">Trợ lý ảo hỗ trợ 24/7</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-white/80 hover:text-white transition-colors p-1 rounded-full hover:bg-white/20"
        >
          <X size={20} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
        {messages.map((message, index) => (
          <motion.div
            key={index}
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.2, delay: index * 0.03 }}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl p-3 ${
                message.role === "user"
                  ? "bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 text-white ml-4"
                  : "bg-white dark:bg-gray-800 text-gray-800 dark:text-white mr-4 shadow-sm border border-gray-200 dark:border-gray-700"
              }`}
            >
              <div className="flex items-center mb-1">
                {message.role === "assistant" ? (
                  <Bot size={14} className="mr-2 text-amber-500" />
                ) : (
                  <User size={14} className="mr-2" />
                )}
                <span className="font-medium text-xs opacity-80">
                  {message.role === "assistant" ? "Trợ lý" : "Bạn"}
                </span>
              </div>
              <div
                className="whitespace-pre-wrap text-sm leading-relaxed"
                dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }}
              />
            </div>
          </motion.div>
        ))}

        {isLoading && (
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.2, delay: messages.length * 0.03 }}
            className="flex justify-start"
          >
            <div className="max-w-[85%] rounded-2xl p-3 bg-white dark:bg-gray-800 text-gray-800 dark:text-white mr-4 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center mb-1">
                <Bot size={14} className="mr-2 text-amber-500" />
                <span className="font-medium text-xs opacity-80">Trợ lý</span>
              </div>
              <div className="flex items-center">
                <Loader2 size={16} className="animate-spin text-amber-500" />
                <span className="ml-2 text-sm">Đang trả lời...</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Quick Actions - only show at the beginning */}
        {messages.length === 1 && (
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.2, delay: 0.05 }}
            className="space-y-2"
          >
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">Câu hỏi thường gặp:</p>
            <div className="grid grid-cols-2 gap-2">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickAction(action.action)}
                  className="text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2 hover:bg-yellow-50 dark:hover:bg-gray-700 transition-all transform hover:scale-105 text-gray-700 dark:text-gray-300"
                >
                  {action.text}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-3 bg-white dark:bg-gray-800">
        <div className="flex items-end space-x-2">
          <div className="flex-1">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Nhập tin nhắn..."
              className="w-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white rounded-xl py-2 px-3 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none text-sm"
              rows={1}
              style={{ minHeight: "36px", maxHeight: "100px" }}
            />
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleSend}
            disabled={isLoading || input.trim() === ""}
            className="bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-500 text-white p-2 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            <Send size={18} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default AIAssistant;
