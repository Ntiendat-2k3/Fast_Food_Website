"use client"

import { motion } from "framer-motion"
import MenuSectionHeader from "./MenuSectionHeader"
import ExploreMenu from "../ExploreMenu"
import FoodDisplay from "../FoodDisplay"

const MenuSection = ({ category, setCategory }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.8 }}
      className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8 md:p-12 shadow-2xl"
    >
      <MenuSectionHeader />

      <ExploreMenu category={category} setCategory={setCategory} />

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4, duration: 0.6 }}>
        <FoodDisplay category={category} />
      </motion.div>
    </motion.div>
  )
}

export default MenuSection
