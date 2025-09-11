"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Truck, Zap, ShieldCheck, IndianRupee, Package, Star, Phone, ArrowRight, Loader2, AlertCircle, TrendingUp, Users } from "lucide-react"
import { validatePhoneNumber, formatPhoneNumber } from "../lib/utils"

export default function Welcome() {
  const [showSignUp, setShowSignUp] = useState(false)
  const [phone, setPhone] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [liveStats, setLiveStats] = useState({
    activePartners: 8247,
    todayEarnings: 342150,
    newJoins: 127
  })
  const router = useRouter()
  
  // Simulate live stats updates
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveStats(prev => ({
        activePartners: prev.activePartners + Math.floor(Math.random() * 3),
        todayEarnings: prev.todayEarnings + Math.floor(Math.random() * 500),
        newJoins: prev.newJoins + (Math.random() > 0.7 ? 1 : 0)
      }))
    }, 5000)
    return () => clearInterval(interval)
  }, [])
  
  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, "")
    if (value.length <= 10) {
      setPhone(formatPhoneNumber(value))
      setError("")
    }
  }
  
  const handleSignUp = async (e) => {
    e.preventDefault()
    setError("")
    
    if (!phone.trim()) {
      setError("Please enter your phone number")
      return
    }
    
    if (!validatePhoneNumber(phone.replace(/\s/g, ""))) {
      setError("Please enter a valid 10-digit phone number")
      return
    }
    
    setIsLoading(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Store phone number and mark as sign up
      localStorage.setItem("partner_phone", phone.replace(/\s/g, ""))
      localStorage.setItem("auth_mode", "signup")
      
      // Navigate to OTP verification
      router.push("/auth/verify-otp")
    } catch (err) {
      setError("Failed to send OTP. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleLogin = () => {
    router.push("/auth/login")
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-brand-50/30 flex flex-col justify-between p-6 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-brand-100/20 to-success-100/20 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-success-100/20 to-brand-100/20 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
      
      {/* Header */}
      <div className="flex justify-center pt-12 relative z-10">
        <div className="feature-card p-6 flex items-center space-x-4">
          <div className="w-16 h-16 bg-gradient-to-br from-brand-500 via-brand-600 to-brand-700 rounded-2xl flex items-center justify-center shadow-lg">
            <Package className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">DeliveryPro</h1>
            <p className="text-slate-500 font-medium">Smart Delivery Platform</p>
            <div className="flex items-center space-x-3 mt-1">
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                <span className="text-sm text-slate-600 font-medium">4.9 Rating</span>
              </div>
              <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
              <span className="text-xs text-green-600 font-semibold">🟢 Live Orders Available</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 bg-clip-text text-transparent mb-6">Start Your Delivery Journey</h2>
          <p className="text-lg text-slate-600 leading-relaxed">
            Join thousands of partners earning daily
          </p>
        </div>

        {/* Auth Section */}
        {showSignUp ? (
          <div className="space-y-6">
            {/* Sign Up Form */}
            <div className="feature-card p-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-slate-800 mb-2">Join Our Platform</h3>
                <p className="text-sm text-slate-600 mb-4">Start earning as a delivery partner today</p>
              </div>
              
              <form onSubmit={handleSignUp} className="space-y-4">
                <div>
                  <label htmlFor="signup-phone" className="block text-sm font-medium text-slate-700 mb-2">
                    📱 Mobile Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="text-slate-500 text-sm font-medium">+91</span>
                    </div>
                    <input
                      id="signup-phone"
                      type="tel"
                      value={phone}
                      onChange={handlePhoneChange}
                      className="w-full pl-16 pr-4 py-4 border-2 border-slate-200 rounded-xl focus:border-brand-500 focus:outline-none text-center text-lg font-semibold tracking-wider transition-colors"
                      placeholder="000 000 0000"
                      maxLength="12"
                      autoComplete="tel"
                    />
                  </div>
                  {error && (
                    <div className="mt-2 flex items-center space-x-2 text-error-600">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-sm">{error}</span>
                    </div>
                  )}
                </div>
                
                <button
                  type="submit"
                  disabled={isLoading || phone.replace(/\s/g, "").length !== 10}
                  className="partner-button-primary w-full py-4 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Sending OTP...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <Phone className="w-5 h-5" />
                      <span>Send OTP & Join Revolution</span>
                    </div>
                  )}
                </button>
              </form>
              
              <div className="mt-4 text-center">
                <button
                  onClick={() => setShowSignUp(false)}
                  className="text-sm text-slate-600 hover:text-slate-800 underline"
                >
                  Back to main page
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Sign Up Button */}
            <button
              onClick={() => setShowSignUp(true)}
              className="partner-button-primary w-full py-5 text-lg font-bold shadow-xl hover:shadow-2xl relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 translate-x-full group-hover:animate-pulse"></div>
              <div className="relative flex items-center justify-center space-x-3">
                <Phone className="w-6 h-6" />
                <span>Start Earning Today</span>
                <ArrowRight className="w-5 h-5" />
              </div>
            </button>
            
            {/* Login Button */}
            <button
              onClick={handleLogin}
              className="w-full py-4 px-6 border-2 border-brand-200 bg-white/80 backdrop-blur-sm text-brand-700 font-semibold rounded-xl hover:bg-brand-50 hover:border-brand-300 transition-all duration-300 shadow-sm hover:shadow-md"
            >
              <div className="flex items-center justify-center space-x-2">
                <Package className="w-5 h-5" />
                <span>🔐 Partner Login</span>
              </div>
            </button>
          </div>
        )}
      </div>

        {/* Footer */}
      <div className="text-center pt-8">
        <p className="text-xs text-slate-500">
          By continuing, you agree to our{" "}
          <Link href="/terms" className="underline hover:text-brand-600">Terms</Link> and{" "}
          <Link href="/privacy" className="underline">Privacy Policy</Link>
        </p>
      </div>
    </div>
  );
}
