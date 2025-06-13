"use client"

import { motion } from "framer-motion"
import { MapPin, Phone, Mail, Clock } from "lucide-react"
import ContactInfoItem from "./ContactInfoItem"
import ContactMap from "./ContactMap"

const ContactInfo = () => {
  const contactItems = [
    {
      icon: MapPin,
      title: "Địa Chỉ",
      content: "123 Đường Nguyễn Văn Linh, Quận 7, TP. Hồ Chí Minh",
    },
    {
      icon: Phone,
      title: "Điện Thoại",
      content: "+84 123 456 789",
    },
    {
      icon: Mail,
      title: "Email",
      content: "info@greeneats.com",
    },
    {
      icon: Clock,
      title: "Giờ Mở Cửa",
      content: "Thứ 2 - Chủ Nhật: 8:00 - 22:00",
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="bg-slate-800/50 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-slate-700"
    >
      <h2 className="text-2xl font-semibold mb-6 text-white flex items-center">
        <Phone className="mr-3 text-yellow-400" size={24} />
        Thông Tin Liên Hệ
      </h2>

      <div className="space-y-6">
        {contactItems.map((item, index) => (
          <ContactInfoItem key={index} icon={item.icon} title={item.title} content={item.content} delay={index * 0.1} />
        ))}
      </div>

      <ContactMap />
    </motion.div>
  )
}

export default ContactInfo
