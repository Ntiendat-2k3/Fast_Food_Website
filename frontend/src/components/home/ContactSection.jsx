"use client"
import { Link } from "react-router-dom"
import { MapPin, Phone, Mail, Clock, Send } from "lucide-react"
import ContactInfoCard from "./ContactInfoCard"

const ContactSection = () => {
  const contactInfo = [
    {
      icon: <MapPin className="w-8 h-8 text-yellow-400" />,
      title: "Địa Chỉ",
      content: "123 Trần Phú, TP. Hà Nội",
    },
    {
      icon: <Phone className="w-8 h-8 text-yellow-400" />,
      title: "Điện Thoại",
      content: "+84 123 456 789",
    },
    {
      icon: <Mail className="w-8 h-8 text-yellow-400" />,
      title: "Email",
      content: "info@greeneats.com",
    },
    {
      icon: <Clock className="w-8 h-8 text-yellow-400" />,
      title: "Giờ Mở Cửa",
      content: "Thứ 2 - Chủ Nhật: 8:00 - 22:00",
    },
  ]

  return (
    <section id="contact" className="py-16 relative">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-white text-center mb-12">Thông Tin Liên Hệ</h2>

        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactInfo.map((info, index) => (
              <ContactInfoCard key={index} icon={info.icon} title={info.title} content={info.content} />
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              to="/contact"
              className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-slate-900 px-8 py-3 rounded-xl transition-all duration-300 inline-flex items-center hover:scale-105 shadow-lg"
            >
              Chat Với Chúng Tôi
              <Send className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ContactSection
