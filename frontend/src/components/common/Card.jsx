"use client"

import { motion } from "framer-motion"

const Card = ({
  children,
  className = "",
  hover = true,
  padding = "md",
  background = "default",
  border = true,
  ...props
}) => {
  const paddings = {
    none: "",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  }

  const backgrounds = {
    default: "bg-slate-800/50 backdrop-blur-xl",
    solid: "bg-slate-800",
    transparent: "bg-transparent",
    gradient: "bg-gradient-to-br from-slate-800/80 to-slate-700/80",
  }

  const baseClasses = `rounded-xl shadow-lg transition-all duration-300 ${
    border ? "border border-slate-700" : ""
  } ${backgrounds[background]} ${paddings[padding]} ${className}`

  const Component = hover ? motion.div : "div"
  const motionProps = hover
    ? {
        whileHover: { y: -2, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" },
        transition: { duration: 0.2 },
      }
    : {}

  return (
    <Component className={baseClasses} {...motionProps} {...props}>
      {children}
    </Component>
  )
}

export default Card
