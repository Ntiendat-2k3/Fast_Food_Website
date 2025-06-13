"use client"
import { useRef } from "react"
import HeroBackground from "./HeroBackground"
import HeroContent from "./HeroContent"
import HeroImage from "./HeroImage"
import ScrollIndicator from "./ScrollIndicator"

const HeroSection = () => {
  const heroRef = useRef(null)

  return (
    <section ref={heroRef} className="relative overflow-hidden pt-20 min-h-screen">
      <HeroBackground />

      <div className="container mx-auto px-4 py-20 md:py-28 relative z-20">
        <div className="flex flex-col md:flex-row items-center min-h-[70vh]">
          <HeroContent />
          <HeroImage />
        </div>
      </div>

      <ScrollIndicator />
    </section>
  )
}

export default HeroSection
