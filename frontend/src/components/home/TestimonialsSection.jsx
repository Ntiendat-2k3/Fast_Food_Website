"use client"
import TestimonialCard from "./TestimonialCard"

const TestimonialsSection = () => {
  const testimonials = [
    {
      name: "Nguyễn Thị Hương",
      role: "Khách hàng thường xuyên",
      comment: "Chất lượng thức ăn và tốc độ giao hàng rất tuyệt vời. Đây là dịch vụ giao đồ ăn yêu thích của tôi!",
      image: "https://randomuser.me/api/portraits/women/44.jpg",
    },
    {
      name: "Trần Minh Tuấn",
      role: "Người yêu ẩm thực",
      comment: "Tôi thích sự đa dạng của các món ăn. Mọi thứ tôi đã thử đều ngon và tươi.",
      image: "https://randomuser.me/api/portraits/men/32.jpg",
    },
    {
      name: "Lê Thị Mai",
      role: "Doanh nhân bận rộn",
      comment: "Giao hàng nhanh và thức ăn luôn nóng hổi. Hoàn hảo cho lịch trình bận rộn của tôi!",
      image: "https://randomuser.me/api/portraits/women/68.jpg",
    },
  ]

  return (
    <section className="py-16 relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">
            <span className="text-white">Khách hàng</span>
            <span className="bg-gradient-to-r from-yellow-400 to-yellow-500 bg-clip-text text-transparent">
              {" "}
              hài lòng
            </span>
          </h2>
          <p className="text-gray-300 max-w-xl mx-auto">
            Hãy xem khách hàng nói gì về trải nghiệm với dịch vụ giao đồ ăn của chúng tôi.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={index} testimonial={testimonial} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default TestimonialsSection
