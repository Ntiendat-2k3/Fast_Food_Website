"use client"
import HeroTitle from "./HeroTitle"
import HeroDescription from "./HeroDescription"
import HeroStats from "./HeroStats"

const HeroSection = () => {
  return (
    <div className="text-center mb-16">
      <HeroTitle />
      <HeroDescription />
      <HeroStats />
    </div>
  )
}

export default HeroSection
