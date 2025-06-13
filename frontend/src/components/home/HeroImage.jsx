"use client"
import { useState, useEffect } from "react"
import { Clock } from "lucide-react"
import { motion } from "framer-motion"

const HeroImage = () => {
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
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

  return (
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
  )
}

export default HeroImage
