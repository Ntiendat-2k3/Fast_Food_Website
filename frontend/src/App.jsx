"use client"

import { useState } from "react"
import { Routes, Route } from "react-router-dom"
import Navbar from "./components/Navbar"
import Home from "./pages/Home/Home"
import Cart from "./pages/Cart/Cart"
import PlaceOrder from "./pages/PlaceOrder/PlaceOrder"
import Footer from "./components/Footer"
import LoginPopup from "./components/LoginPopup"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import MyOrders from "./pages/MyOrders/MyOrders"
import Foods from "./pages/Foods/Foods"
import ProductDetail from "./pages/ProductDetail/ProductDetail"
import Contact from "./pages/Contact/Contact"
import Payment from "./pages/Payment/Payment"
import Thankyou from "./pages/Thankyou/Thankyou"
import Wishlist from "./pages/Wishlist/Wishlist"
import PurchaseHistory from "./pages/PurchaseHistory/PurchaseHistory"
import AIAssistant from "./components/AIAssistant"
import { MessageCircle } from "lucide-react"
import ResetPassword from "./pages/ResetPassword/ResetPassword"
import ChangePasswordModal from "./components/ChangePasswordModal"

const App = () => {
  const [showLogin, setShowLogin] = useState(false)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false)

  return (
    <>
      {showLogin ? <LoginPopup setShowLogin={setShowLogin} /> : <></>}
      {showChangePasswordModal && <ChangePasswordModal onClose={() => setShowChangePasswordModal(false)} />}{" "}
      <div className="app">
      <Navbar setShowLogin={setShowLogin} setShowChangePasswordModal={setShowChangePasswordModal} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/order" element={<PlaceOrder />} />
          <Route path="/myorders" element={<MyOrders />} />
          <Route path="/foods" element={<Foods />} />
          <Route path="/product/:slug" element={<ProductDetail />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/payment/:method/:orderId" element={<Payment />} />
          <Route path="/thankyou" element={<Thankyou />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/purchase-history" element={<PurchaseHistory />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Routes>
      </div>
      <Footer />
      <ToastContainer />

       {/* Chat button */}
       <button
            onClick={() => setIsChatOpen(true)}
            className="fixed bottom-6 right-6 bg-gradient-to-r from-green-400 to-green-600 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all z-40"
            aria-label="Open chat assistant"
          >
            <MessageCircle size={24} />
          </button>

          {/* AI Assistant */}
          <AIAssistant isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </>
  )
}

export default App
