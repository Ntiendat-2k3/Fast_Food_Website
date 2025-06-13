"use client"

import { useState } from "react"
import PageLayout from "../../components/layout/PageLayout"
import HeroBackground from "../../components/hero/HeroBackground"
import HeroSection from "../../components/hero/HeroSection"
import MenuSection from "../../components/menu/MenuSection"

const Foods = () => {
  const [category, setCategory] = useState("All")

  return (
    <PageLayout background={<HeroBackground />}>
      <HeroSection />
      <MenuSection category={category} setCategory={setCategory} />
    </PageLayout>
  )
}

export default Foods
