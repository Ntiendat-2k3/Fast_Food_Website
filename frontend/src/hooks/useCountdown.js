"use client"

import { useState, useEffect } from "react"

const useCountdown = (initialSeconds = 300, onComplete) => {
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
  }, [onComplete, initialSeconds])

  // Format thời gian đếm ngược
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return {
    countdown,
    formattedTime: formatTime(countdown),
    percentRemaining: (countdown / initialSeconds) * 100,
    isAlmostFinished: countdown < initialSeconds * 0.2,
  }
}

export default useCountdown
