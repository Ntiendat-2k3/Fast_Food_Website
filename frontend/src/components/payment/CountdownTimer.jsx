"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

const CountdownTimer = ({ initialSeconds = 300, onComplete }) => {
  const [countdown, setCountdown] = useState(initialSeconds)

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          if (onComplete) onComplete()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [onComplete])

  // Format thời gian đếm ngược
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // Tính toán phần trăm thời gian còn lại
  const percentRemaining = (countdown / initialSeconds) * 100

  return (
    <motion.span
      className="font-bold text-primary"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {formatTime(countdown)}
      {percentRemaining < 20 && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1 }}
          className="ml-1 text-red-500"
        >
          !
        </motion.span>
      )}
    </motion.span>
  )
}

export default CountdownTimer
