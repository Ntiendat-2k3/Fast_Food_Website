"use client"
import { useEffect, useState } from "react"

const HeroBackground = () => {
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
    <>
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-yellow-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-80 h-80 bg-yellow-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

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
    </>
  )
}

export default HeroBackground
