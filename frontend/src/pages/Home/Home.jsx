"use client"

import { useState, useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import { useContext } from "react"
import {
  ArrowRight,
  Star,
  Clock,
  Truck,
  ShoppingBag,
  ChevronRight,
  Heart,
  MapPin,
  Phone,
  Mail,
  Send,
  Sparkles,
  Zap,
  Award,
} from "lucide-react"
import { motion } from "framer-motion"
import { StoreContext } from "../../context/StoreContext"
import { slugify } from "../../utils/slugify"

const Home = () => {
  const [category, setCategory] = useState("All")
  const { food_list, url } = useContext(StoreContext)
  const [featuredItems, setFeaturedItems] = useState([])
  const [scrollY, setScrollY] = useState(0)
  const heroRef = useRef(null)

  useEffect(() => {
    // Get 3 random items for featured section
    if (food_list.length > 0) {
      const shuffled = [...food_list].sort(() => 0.5 - Math.random())
      setFeaturedItems(shuffled.slice(0, 3))
    }
  }, [food_list])

  useEffect(() => {
    // Parallax scroll effect
    const handleScroll = () => {
      // Check for reduced motion preference
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
      if (prefersReducedMotion) return

      setScrollY(window.scrollY)
    }

    const throttledHandleScroll = () => {
      requestAnimationFrame(handleScroll)
    }

    window.addEventListener("scroll", throttledHandleScroll, { passive: true })
    return () => window.removeEventListener("scroll", throttledHandleScroll)
  }, [])

  // Testimonials data
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

  // Services data
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

  // Categories for quick access
  const categories = [
    {
      name: "Burger",
      image:
        "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1202&q=80",
    },
    {
      name: "Pizza",
      image:
        "https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
    },
    {
      name: "Pasta",
      image:
        "https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
    },
    {
      name: "Salad",
      image:
        "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
    },
  ]

  // Background food images for parallax
  const backgroundImages = [
    {
      src: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
      speed: 0.5,
      position: { row: 1, col: 1 },
    },
    {
      src: "https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
      speed: 0.3,
      position: { row: 1, col: 2 },
    },
    {
      src: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1202&q=80",
      speed: 0.7,
      position: { row: 1, col: 3 },
    },
    {
      src: "https://images.unsplash.com/photo-1603064752734-4c48eff53d05?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
      speed: 0.4,
      position: { row: 1, col: 4 },
    },
    {
      src: "https://images.unsplash.com/photo-1484723091739-30a097e8f929?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
      speed: 0.6,
      position: { row: 2, col: 1 },
    },
    {
      src: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
      speed: 0.8,
      position: { row: 2, col: 2 },
    },
    {
      src: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
      speed: 0.2,
      position: { row: 2, col: 3 },
    },
    {
      src: "https://images.unsplash.com/photo-1606787366850-de6330128bfc?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
      speed: 0.9,
      position: { row: 2, col: 4 },
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-yellow-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-80 h-80 bg-yellow-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Hero Section */}
      <section ref={heroRef} className="relative overflow-hidden pt-20 min-h-screen">
        {/* Parallax Food Background */}
        <div className="absolute inset-0 z-0">
          {/* Main gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/85 via-slate-900/80 to-slate-900/95 z-10"></div>

          {/* Secondary blur overlay */}
          <div className="absolute inset-0 z-[5]"></div>

          {/* Parallax Background Grid */}
          <div className="absolute inset-0 z-0">
            <div className="grid grid-cols-3 md:grid-cols-4 gap-4 h-full">
              {backgroundImages.map((image, index) => (
                <div
                  key={index}
                  className={`relative overflow-hidden ${image.position.col === 4 ? "hidden md:block" : ""}`}
                  style={{
                    transform: `translateY(${scrollY * image.speed}px)`,
                    transition: "transform 0.1s ease-out",
                  }}
                >
                  <img
                    src={image.src || "/placeholder.svg"}
                    alt=""
                    className="w-full h-80 object-cover opacity-40 scale-110"
                    loading="lazy"
                  />
                  {/* Individual image overlay for depth */}
                  <div
                    className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"
                    style={{
                      transform: `translateY(${scrollY * (image.speed * 0.5)}px)`,
                    }}
                  ></div>
                </div>
              ))}
            </div>
          </div>

          {/* Floating particles effect */}
          <div className="absolute inset-0 z-[8]">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-yellow-400/20 rounded-full animate-pulse"
                style={{
                  left: `${20 + i * 15}%`,
                  top: `${30 + i * 10}%`,
                  transform: `translateY(${scrollY * (0.1 + i * 0.05)}px)`,
                  animationDelay: `${i * 0.5}s`,
                }}
              ></div>
            ))}
          </div>
        </div>

        <div className="container mx-auto px-4 py-20 md:py-28 relative z-20">
          <div className="flex flex-col md:flex-row items-center min-h-[70vh]">
            <div className="md:w-1/2 mb-12 md:mb-0">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
                className="max-w-xl"
              >
                <div className="flex items-center mb-4">
                  <Sparkles className="text-yellow-400 mr-2" size={24} />
                  <span className="text-yellow-400 font-medium">Chào mừng đến với GreenEats</span>
                </div>
                <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white leading-tight">
                  Thưởng thức{" "}
                  <span className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-400 bg-clip-text text-transparent">
                    ẩm thực
                  </span>{" "}
                  tuyệt vời tại nhà
                </h1>
                <p className="text-gray-300 text-lg mb-8 leading-relaxed">
                  Đặt món ăn yêu thích của bạn chỉ với vài cú nhấp chuột. Chúng tôi giao hàng nhanh chóng và đảm bảo
                  chất lượng.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link
                    to="/foods"
                    className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-slate-900 font-medium py-3 px-8 rounded-xl transition-all duration-300 flex items-center shadow-lg hover:shadow-yellow-400/25 hover:scale-105"
                  >
                    Đặt hàng ngay <ArrowRight size={18} className="ml-2" />
                  </Link>
                  <Link
                    to="/foods"
                    className="bg-slate-800/50 backdrop-blur-sm hover:bg-slate-700/50 border border-slate-600 text-white font-medium py-3 px-8 rounded-xl transition-all duration-300"
                  >
                    Xem thực đơn
                  </Link>
                </div>
              </motion.div>
            </div>
            <div className="md:w-1/2">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="relative"
                style={{
                  transform: `translateY(${scrollY * -0.1}px)`,
                }}
              >
                <img
                  src="https://img.freepik.com/free-photo/delicious-burger-with-many-ingredients-isolated-white-background-tasty-cheeseburger-splash-sauce_90220-1266.jpg"
                  alt="Delicious Burger"
                  className="w-full max-w-lg mx-auto rounded-2xl shadow-2xl"
                />
                <div
                  className="absolute -bottom-6 -left-6 bg-slate-800/80 backdrop-blur-sm rounded-xl p-4 shadow-xl border border-slate-700"
                  style={{
                    transform: `translateY(${scrollY * -0.05}px)`,
                  }}
                >
                  <div className="flex items-center">
                    <div className="bg-yellow-400 rounded-full p-2 mr-3">
                      <Clock className="h-6 w-6 text-slate-900" />
                    </div>
                    <div>
                      <p className="text-white font-bold">Giao hàng nhanh</p>
                      <p className="text-gray-300 text-sm">30 phút hoặc miễn phí</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
          <div className="animate-bounce">
            <div className="w-6 h-10 border-2 border-yellow-400/50 rounded-full flex justify-center">
              <div className="w-1 h-3 bg-yellow-400 rounded-full mt-2 animate-pulse"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 relative">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { number: "10K+", label: "Khách hàng hài lòng", icon: <Heart className="h-6 w-6" /> },
              { number: "500+", label: "Món ăn đa dạng", icon: <ShoppingBag className="h-6 w-6" /> },
              { number: "50+", label: "Đối tác nhà hàng", icon: <Award className="h-6 w-6" /> },
              { number: "24/7", label: "Phục vụ không ngừng", icon: <Zap className="h-6 w-6" /> },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 text-center border border-slate-700 hover:border-yellow-400/50 transition-all duration-300"
              >
                <div className="text-yellow-400 mb-2 flex justify-center">{stat.icon}</div>
                <div className="text-2xl font-bold text-white mb-1">{stat.number}</div>
                <div className="text-gray-300 text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-white">Khám phá danh mục</h2>
            <p className="text-gray-300 max-w-xl mx-auto">
              Tìm kiếm món ăn yêu thích của bạn từ nhiều danh mục khác nhau
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {categories.map((category, index) => (
              <Link to="/foods" key={index}>
                <motion.div
                  whileHover={{ y: -5, scale: 1.02 }}
                  className="relative rounded-xl overflow-hidden shadow-md h-40 group bg-slate-800/50 backdrop-blur-sm border border-slate-700 hover:border-yellow-400/50 transition-all duration-300"
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-800/50 to-transparent z-10"></div>
                  <img
                    src={category.image || "/placeholder.svg"}
                    alt={category.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute bottom-0 left-0 p-4 z-20">
                    <h3 className="text-white font-bold text-xl">{category.name}</h3>
                  </div>
                  <div className="absolute top-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="bg-yellow-400 text-slate-900 p-1 rounded-full">
                      <ArrowRight size={16} />
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Menu Section */}
      <section className="py-16 relative">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-3xl font-bold">
              <span className="text-white">Thực đơn </span>
              <span className="bg-gradient-to-r from-yellow-400 to-yellow-500 bg-clip-text text-transparent">
                nổi bật
              </span>
            </h2>
            <Link
              to="/foods"
              className="text-yellow-400 hover:text-yellow-300 flex items-center font-medium transition-colors"
            >
              Xem tất cả <ChevronRight size={18} className="ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredItems.map((item, index) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-slate-800/50 backdrop-blur-sm rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-slate-700 hover:border-yellow-400/50 group"
              >
                <div className="h-48 overflow-hidden relative">
                  <img
                    src={url + "/images/" + item.image || "/placeholder.svg"}
                    alt={item.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute top-3 right-3 bg-slate-800/80 backdrop-blur-sm rounded-full p-2 shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
                    <Heart className="h-5 w-5 text-yellow-400" />
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-white">{item.name}</h3>
                    <div className="flex items-center bg-yellow-400/20 px-2 py-1 rounded-full">
                      <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 mr-1" />
                      <span className="text-sm font-medium text-yellow-400">4.8</span>
                    </div>
                  </div>
                  <p className="text-gray-300 mb-4 line-clamp-2">{item.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-yellow-400">{item.price.toLocaleString("vi-VN")} đ</span>
                    <Link
                      to={`/product/${slugify(item.name)}`}
                      className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-slate-900 font-medium py-2 px-4 rounded-lg transition-all duration-300 text-sm hover:scale-105"
                    >
                      Đặt ngay
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Special Offer Section */}
      <section className="py-16 relative">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center bg-slate-800/50 backdrop-blur-sm rounded-2xl overflow-hidden shadow-xl border border-slate-700">
            <div className="md:w-1/2 p-8 md:p-12">
              <span className="inline-block bg-gradient-to-r from-yellow-400 to-yellow-500 text-slate-900 text-sm font-bold px-3 py-1 rounded-full mb-4">
                Ưu đãi đặc biệt
              </span>
              <h2 className="text-3xl md:text-4xl font-bold mb-2 text-white">Combo burger đặc biệt</h2>
              <p className="text-gray-300 mb-6 leading-relaxed">
                Thưởng thức combo burger đặc biệt của chúng tôi với giá ưu đãi. Chỉ áp dụng trong hôm nay, đừng bỏ lỡ cơ
                hội này!
              </p>
              <div className="mb-6">
                <span className="text-yellow-400 text-5xl font-bold">45.000đ</span>
                <span className="text-gray-400 text-xl ml-2 line-through">69.000đ</span>
              </div>
              <Link
                to="/foods"
                className="inline-block bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-slate-900 font-medium py-3 px-8 rounded-xl transition-all duration-300 shadow-lg hover:scale-105"
              >
                Đặt ngay
              </Link>
            </div>
            <div className="md:w-1/2 relative">
              <img
                src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1202&q=80"
                alt="Burger đặc biệt"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 right-4 bg-red-500 text-white text-sm font-bold px-4 py-2 rounded-full">
                -35%
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
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
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-8 shadow-lg hover:shadow-yellow-400/10 transition-all hover:-translate-y-1 border border-slate-700 hover:border-yellow-400/50 group"
              >
                <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-xl w-16 h-16 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  {service.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{service.title}</h3>
                <p className="text-gray-300">{service.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
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
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-slate-700 hover:border-yellow-400/50"
              >
                <div className="flex items-center mb-4">
                  <img
                    src={testimonial.image || "/placeholder.svg"}
                    alt={testimonial.name}
                    className="w-14 h-14 rounded-full object-cover mr-4 border-2 border-yellow-400"
                  />
                  <div>
                    <h4 className="font-bold text-white">{testimonial.name}</h4>
                    <p className="text-gray-300 text-sm">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-300 italic mb-4">"{testimonial.comment}"</p>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 relative">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Thông Tin Liên Hệ</h2>

          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-lg shadow-md text-center hover:shadow-lg transition-all duration-300 border border-slate-700 hover:border-yellow-400/50 group">
                <div className="w-16 h-16 bg-yellow-400/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-yellow-400/30 transition-colors">
                  <MapPin className="w-8 h-8 text-yellow-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-white">Địa Chỉ</h3>
                <p className="text-gray-300">123 Đường Nguyễn Văn Linh, Quận 7, TP. Hồ Chí Minh</p>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-lg shadow-md text-center hover:shadow-lg transition-all duration-300 border border-slate-700 hover:border-yellow-400/50 group">
                <div className="w-16 h-16 bg-yellow-400/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-yellow-400/30 transition-colors">
                  <Phone className="w-8 h-8 text-yellow-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-white">Điện Thoại</h3>
                <p className="text-gray-300">+84 123 456 789</p>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-lg shadow-md text-center hover:shadow-lg transition-all duration-300 border border-slate-700 hover:border-yellow-400/50 group">
                <div className="w-16 h-16 bg-yellow-400/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-yellow-400/30 transition-colors">
                  <Mail className="w-8 h-8 text-yellow-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-white">Email</h3>
                <p className="text-gray-300">info@greeneats.com</p>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-lg shadow-md text-center hover:shadow-lg transition-all duration-300 border border-slate-700 hover:border-yellow-400/50 group">
                <div className="w-16 h-16 bg-yellow-400/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-yellow-400/30 transition-colors">
                  <Clock className="w-8 h-8 text-yellow-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-white">Giờ Mở Cửa</h3>
                <p className="text-gray-300">Thứ 2 - Chủ Nhật: 8:00 - 22:00</p>
              </div>
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
    </div>
  )
}

export default Home
