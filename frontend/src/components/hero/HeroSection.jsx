"use client"
import HeroTitle from "./HeroTitle"
import HeroDescription from "./HeroDescription"
import HeroStats from "./HeroStats"

const HeroSection = () => {
  return (
    <div className="text-center mb-8 md:mb-16">
      <HeroTitle />
      {/* Hide description on mobile */}
      <div className="hidden md:block">
        <HeroDescription />
      </div>
      <HeroStats />
    </div>
  )
}

export default HeroSection
