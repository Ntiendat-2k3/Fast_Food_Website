"use client"
import { useState, useEffect } from "react"
import { useContext } from "react"
import { StoreContext } from "../../context/StoreContext"
import HeroSection from "../../components/home/HeroSection"
import StatsSection from "../../components/home/StatsSection"
import CategoriesSection from "../../components/home/CategoriesSection"
import FeaturedMenuSection from "../../components/home/FeaturedMenuSection"
import SpecialOfferSection from "../../components/home/SpecialOfferSection"
import ServicesSection from "../../components/home/ServicesSection"
import TestimonialsSection from "../../components/home/TestimonialsSection"
import ContactSection from "../../components/home/ContactSection"

const Home = () => {
  const { food_list, url } = useContext(StoreContext)
  const [featuredItems, setFeaturedItems] = useState([])

  useEffect(() => {
    // Get 3 random items for featured section
    if (food_list.length > 0) {
      const shuffled = [...food_list].sort(() => 0.5 - Math.random())
      setFeaturedItems(shuffled.slice(0, 3))
    }
  }, [food_list])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800">
      <HeroSection />
      <StatsSection />
      <CategoriesSection />
      <FeaturedMenuSection featuredItems={featuredItems} url={url} />
      <SpecialOfferSection />
      <ServicesSection />
      <TestimonialsSection />
      <ContactSection />
    </div>
  )
}

export default Home
