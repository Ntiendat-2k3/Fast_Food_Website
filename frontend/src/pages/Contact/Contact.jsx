"use client"

import { useContext } from "react"
import { useNavigate } from "react-router-dom"
import { StoreContext } from "../../context/StoreContext"
import ContactHeader from "../../components/contact/ContactHeader"
import ContactInfo from "../../components/contact/ContactInfo"
import ChatSection from "../../components/chat/ChatSection"
import AnimatedBackground from "../../components/common/AnimatedBackground"

const Contact = () => {
  const { user } = useContext(StoreContext)
  const navigate = useNavigate()

  const handleLoginClick = () => {
    navigate("/")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 pt-20 pb-16">
      <AnimatedBackground />

      <div className="container mx-auto px-4 relative z-10">
        <ContactHeader />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ContactInfo />
          <ChatSection user={user} onLoginClick={handleLoginClick} />
        </div>
      </div>
    </div>
  )
}

export default Contact
