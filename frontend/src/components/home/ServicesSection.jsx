"use client"
import { Truck, ShoppingBag, Clock } from "lucide-react"
import ServiceCard from "./ServiceCard"

const ServicesSection = () => {
  const services = [
    {
      title: "Giao hàng nhanh",
      description: "Chúng tôi giao đồ ăn trong vòng 30 phút trong khu vực của bạn.",
      icon: <Truck className="h-8 w-8 text-slate-900" />,
    },
    {
      title: "Đặt hàng dễ dàng",
      description: "Đặt đồ ăn chỉ với vài cú nhấp chuột và thanh toán trực tuyến an toàn.",
      icon: <ShoppingBag className="h-8 w-8 text-slate-900" />,
    },
    {
      title: "Phục vụ 24/7",
      description: "Dịch vụ khách hàng của chúng tôi hoạt động 24/7 để hỗ trợ bạn.",
      icon: <Clock className="h-8 w-8 text-slate-900" />,
    },
  ]

  return (
    <section className="py-16 relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">
            <span className="text-white">Dịch vụ </span>
            <span className="bg-gradient-to-r from-yellow-400 to-yellow-500 bg-clip-text text-transparent">
              của chúng tôi
            </span>
          </h2>
          <p className="text-gray-300 max-w-xl mx-auto">
            Chúng tôi cung cấp dịch vụ tốt nhất để đảm bảo thức ăn của bạn đến tươi ngon và đúng giờ.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <ServiceCard key={index} service={service} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default ServicesSection
